import RevealOnScroll from '../components/RevealOnScroll'
import GlassPanel from '../components/GlassPanel'

function About() {
  return (
    <section id="sobre-mi" className="mx-auto max-w-4xl px-6 py-24">
      <RevealOnScroll>
        <GlassPanel className="px-8 py-10">
          <h2 className="text-2xl font-semibold text-white">Sobre mi</h2>
          <p className="mt-4 text-neutral-300">
            Desarrollador de software en formacion, construyendo productos reales y
            comercializables (como VeriFactu, un sistema de facturacion electronica)
            mientras profundiza en infraestructura: Docker, despliegue en servidores
            propios y arquitecturas backend completas. Le interesa entender el ciclo
            completo de un producto, desde el codigo hasta como llega a produccion.
          </p>
        </GlassPanel>
      </RevealOnScroll>
    </section>
  )
}

export default About
