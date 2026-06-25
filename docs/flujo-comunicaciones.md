# Flujo de comunicaciones — cómo interactúa todo el proyecto

Este documento explica, paso a paso, qué pasa exactamente cuando alguien visita
`carlosdiaz.pro` hasta que ve los proyectos cargados en pantalla. El objetivo es
entender el ciclo completo (DNS → hosting → certificados → frontend → backend),
no solo memorizar comandos.

---

## Mapa general de las piezas

```
[Usuario en su navegador]
        |
        | 1. escribe carlosdiaz.pro
        v
   [DNS de Porkbun]  ---- responde con una IP
        |
        v
   [Vercel]  (sirve el frontend, React/Vite, con HTTPS automático)
        |
        | 2. la pagina ya cargada hace fetch() a la API
        v
   [DNS de Porkbun otra vez]  ---- resuelve api.carlosdiaz.pro
        |
        v
   [EC2 — Nginx]  (puerto 443, HTTPS)
        |
        | 3. Nginx reenvia la peticion internamente
        v
   [EC2 — contenedor Docker "api" (FastAPI), puerto 8000, NO publico]
        |
        v
   [EC2 — contenedor Docker "db" (MySQL)]
```

Dos dominios, dos servicios distintos, cada uno con su propio certificado SSL:

- `carlosdiaz.pro` → frontend → vive en **Vercel**
- `api.carlosdiaz.pro` → backend → vive en **tu EC2**

---

## Paso 1 — El navegador necesita una IP (DNS)

Un dominio (`carlosdiaz.pro`) es solo un nombre legible para humanos. Internet
en el fondo funciona con **direcciones IP** (ej. `216.198.79.1`). El DNS es el
sistema que traduce nombre → IP, como una agenda de contactos gigante y
distribuida por todo el mundo.

Cuando escribes `carlosdiaz.pro` en el navegador:

1. Tu ordenador pregunta "¿qué IP tiene `carlosdiaz.pro`?"
2. Esa pregunta llega a los **nameservers** del dominio — en tu caso, los de
   Porkbun (`curitiba.porkbun.com`, `fortaleza.porkbun.com`, etc.). Son los
   servidores que tienen la "ficha" autorizada de tu dominio.
3. Porkbun responde según el **registro DNS** que configuramos:
   - Tipo **A** → significa "este nombre apunta directamente a esta IP"
   - Host `@` (vacío) → significa "esto aplica a la raíz del dominio", no a
     un subdominio
   - Valor `216.198.79.1` → la IP de los servidores de Vercel
4. Tu navegador ya sabe a qué IP conectarse, y abre la conexión ahí.

### ¿Qué es el TTL?
TTL = "Time To Live", en segundos. Le dice a todo el mundo (tu router, tu
proveedor de internet, otros DNS intermedios) **cuánto tiempo pueden guardar
en caché esa respuesta** antes de volver a preguntar. Con TTL `600` (10
minutos), si cambias el registro DNS, puede tardar hasta 10 minutos en que
todo el mundo vea el cambio nuevo — por eso hablamos de "propagación DNS".

### Otros tipos de registro que viste en Porkbun
- **ALIAS** — como un CNAME pero válido también en la raíz del dominio (el
  `ALIAS @ → pixie.porkbun.com` original era el que mostraba la página de
  aparcamiento de Porkbun; lo sustituimos por el `A` hacia Vercel).
- **CNAME** — "este nombre es un alias de otro nombre" (no de una IP
  directamente). El `CNAME * → pixie.porkbun.com` es un wildcard: cualquier
  subdominio no definido explícitamente cae ahí por defecto.
- **MX** — a qué servidor de correo reenviar los emails de `@carlosdiaz.pro`.
- **TXT** — texto libre, usado aquí para verificación anti-spam (SPF) del
  reenvío de correo.
- **NS** — qué servidores son los "autorizados" para responder por tu dominio.
- **SOA** — metadatos técnicos del propio DNS (quién lo administra, cada
  cuánto se refresca).

---

## Paso 2 — HTTPS y el certificado SSL/TLS

Una vez el navegador tiene la IP, antes de pedir ninguna página, hace un
**handshake TLS**: comprueba que el servidor al otro lado tiene un
**certificado SSL válido** para ese dominio.

El certificado cumple dos funciones:
1. **Cifra** la conexión, para que nadie en medio (tu wifi, tu proveedor de
   internet) pueda leer o modificar los datos.
2. **Verifica identidad** — demuestra que quien responde en esa IP realmente
   controla el dominio `carlosdiaz.pro` (lo emitió una autoridad de
   confianza, en nuestro caso Let's Encrypt).

Sin certificado válido → el navegador marca la web como "no segura" o
directamente bloquea la conexión.

- En **Vercel**, el certificado se genera y renueva automáticamente en
  segundo plano — no hace falta tocar nada.
- En la **EC2**, lo gestionamos nosotros manualmente con **Certbot**, que
  habla con Let's Encrypt, demuestra que controlamos `api.carlosdiaz.pro`
  (porque el DNS ya apunta a esa IP) y descarga el certificado. Certbot
  además configura una renovación automática, porque estos certificados
  caducan cada ~90 días.

---

## Paso 3 — El frontend ya cargó. Ahora pide datos a la API

La página en `carlosdiaz.pro` es una SPA (Single Page App) de React. Al
cargar, ejecuta código JavaScript que hace algo como:

```
fetch("https://api.carlosdiaz.pro/projects")
```

Esto repite el mismo ciclo DNS + TLS que el Paso 1 y 2, pero ahora para el
subdominio `api.carlosdiaz.pro`, que apunta a la IP de tu **EC2**
(`51.49.155.47`) en vez de a Vercel.

### ¿Por qué un subdominio y no el mismo dominio?
Porque son dos servicios completamente distintos, alojados en sitios
distintos (Vercel vs tu propia EC2). Cada uno necesita su propio registro DNS
y su propio certificado SSL. Es un patrón muy común: `miweb.com` para el
frontend, `api.miweb.com` para el backend.

### CORS — por qué el backend necesita saber quién le pregunta
Como el frontend (`carlosdiaz.pro`) y el backend (`api.carlosdiaz.pro`) son
dominios distintos, el navegador aplica una política de seguridad llamada
**CORS** (Cross-Origin Resource Sharing): por defecto, JavaScript en una
página NO puede pedir datos a un dominio distinto al que la sirvió, a menos
que ese dominio lo autorice explícitamente.

Por eso el backend tiene la variable `CORS_ORIGINS` en su `.env` — es la
lista blanca de dominios autorizados a pedirle datos (en este caso, debe
incluir `https://carlosdiaz.pro`). Si no está bien configurada, el navegador
bloquea la respuesta aunque el servidor sí haya respondido correctamente.

---

## Paso 4 — Dentro de la EC2: Nginx como "recepcionista"

La petición a `api.carlosdiaz.pro` llega por HTTPS al puerto **443** de la
EC2. Pero tu API en realidad corre dentro de un contenedor Docker, escuchando
en el puerto **8000** — y ese puerto nunca está abierto al público (recuerda
el Security Group: solo 22, 80, 443).

Aquí entra **Nginx**:

1. Nginx es el único que escucha en el 443 de cara al público.
2. Termina la conexión HTTPS (usa el certificado de Certbot para descifrar).
3. Reenvía la petición, ya en texto plano, internamente dentro de la propia
   máquina, hacia `localhost:8000` — donde está tu contenedor `api`.
4. La respuesta de la API vuelve a Nginx, que la cifra de nuevo y se la manda
   al navegador del usuario.

A esto se le llama **reverse proxy**: un servidor que recibe tráfico público
"en nombre de" otro servicio interno, que se queda oculto y protegido.

### ¿Por qué no exponer el puerto 8000 directamente?
- No tendría HTTPS (Docker/FastAPI no gestionan certificados solos).
- Mezclar responsabilidades: es mejor que un solo punto (Nginx) controle
  todo el tráfico de entrada — límites de tasa, logs, qué dominios acepta,
  redirecciones, etc. — en vez de cada contenedor gestionando eso por su
  cuenta.

---

## Resumen del ciclo completo (un ejemplo real)

1. Escribes `carlosdiaz.pro` → DNS de Porkbun responde con la IP de Vercel.
2. Tu navegador hace el handshake TLS con Vercel, certificado válido, carga
   la página React.
3. El JavaScript de la página pide datos a `https://api.carlosdiaz.pro/projects`.
4. DNS de Porkbun responde con la IP de tu EC2.
5. Handshake TLS con la EC2, usando el certificado que generó Certbot.
6. Nginx recibe la petición en el puerto 443, la reenvía a `localhost:8000`.
7. El contenedor `api` (FastAPI) la procesa, consulta a MySQL (`db`,
   dentro de la misma red Docker, nunca expuesto al público).
8. La respuesta vuelve: `api` → Nginx → cifrado HTTPS → navegador.
9. El navegador comprueba que el dominio que respondió (`api.carlosdiaz.pro`)
   está en la lista de `CORS_ORIGINS` permitida por el backend — si está,
   entrega los datos a React, que los pinta en pantalla.

---

## Glosario rápido

| Término | En una frase |
|---|---|
| DNS | Sistema que traduce nombres de dominio a direcciones IP |
| Registro A | Regla DNS: "este nombre = esta IP, directamente" |
| TTL | Cuánto tiempo se puede cachear una respuesta DNS antes de volver a preguntar |
| Propagación DNS | El tiempo que tarda un cambio DNS en verse reflejado en todo internet |
| SSL/TLS | El protocolo que cifra y verifica la identidad de una conexión HTTPS |
| Certificado SSL | El "documento de identidad" digital de un dominio, emitido por una autoridad de confianza |
| Let's Encrypt | Autoridad de certificados gratuita usada por Certbot y por Vercel |
| Reverse proxy | Servidor que recibe tráfico público y lo reenvía a un servicio interno protegido |
| CORS | Política del navegador que controla qué dominios pueden pedirse datos entre sí |
| Subdominio | Una "sección" de tu dominio (`api.` en `api.carlosdiaz.pro`) que puede vivir en un servidor totalmente distinto |
