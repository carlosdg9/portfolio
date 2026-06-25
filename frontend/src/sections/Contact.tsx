import RevealOnScroll from '../components/RevealOnScroll'
import GlassPanel from '../components/GlassPanel'

const links = [
  { label: 'Email', href: 'mailto:carlosdg9@icloud.com' },
  { label: 'GitHub', href: 'https://github.com/carlosdg9' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/carlosendiaz/' },
]

function Contact() {
  return (
    <section id="contacto" className="mx-auto max-w-4xl px-6 py-24">
      <RevealOnScroll>
        <GlassPanel className="px-8 py-10 text-center">
          <h2 className="text-fg text-2xl font-semibold">Contacto</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                className="text-fg rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-5 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
              >
                {link.label}
              </a>
            ))}
          </div>
        </GlassPanel>
      </RevealOnScroll>
    </section>
  )
}

export default Contact
