import RevealOnScroll from '../components/RevealOnScroll'
import GlassPanel from '../components/GlassPanel'

function Contact() {
  return (
    <section id="contacto" className="mx-auto max-w-4xl px-6 py-24">
      <RevealOnScroll>
        <GlassPanel className="px-8 py-10 text-center">
          <h2 className="text-2xl font-semibold text-white">Contacto</h2>
          <p className="mt-4 text-neutral-300">
            Datos de contacto pendientes de definir en la Fase 3.
          </p>
        </GlassPanel>
      </RevealOnScroll>
    </section>
  )
}

export default Contact
