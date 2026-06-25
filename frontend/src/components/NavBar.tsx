import { useTheme } from '../lib/theme'

const sections = [
  { id: 'hero', label: 'Inicio' },
  { id: 'sobre-mi', label: 'Sobre mi' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'contacto', label: 'Contacto' },
]

function NavBar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="glass-nav fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <span className="text-fg text-sm font-medium">Carlos Diaz</span>
        <div className="flex items-center gap-4 sm:gap-6">
          <ul className="text-fg-muted flex gap-3 text-xs sm:gap-6 sm:text-sm">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="transition-colors hover:text-accent"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="text-fg rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-1 text-xs transition-colors hover:text-accent"
          >
            {theme === 'dark' ? 'Oscuro' : 'Claro'}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
