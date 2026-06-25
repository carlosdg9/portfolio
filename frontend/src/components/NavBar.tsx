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
        <span className="text-fg text-sm font-medium">Carlos Díaz</span>
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
            className="text-fg flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] transition-colors hover:text-accent"
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <circle cx="12" cy="12" r="4" />
                <path
                  strokeLinecap="round"
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
