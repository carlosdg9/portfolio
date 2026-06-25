import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import RevealOnScroll from '../components/RevealOnScroll'
import { fetchProjects } from '../lib/api'

function Projects() {
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  return (
    <section id="proyectos" className="mx-auto max-w-5xl px-6 py-24">
      <RevealOnScroll>
        <h2 className="text-fg text-2xl font-semibold">Proyectos</h2>
      </RevealOnScroll>

      {isLoading && <p className="text-fg-muted mt-8">Cargando proyectos...</p>}
      {isError && <p className="text-fg-muted mt-8">No se pudieron cargar los proyectos.</p>}
      {projects && projects.length === 0 && (
        <p className="text-fg-muted mt-8">Proyectos pendientes de publicar.</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project, index) => (
          <RevealOnScroll key={project.id} delay={index * 0.1}>
            <motion.div
              className="glass-panel h-full px-6 py-8"
              whileHover={{ y: -6, borderColor: 'rgba(168, 85, 247, 0.5)' }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-fg text-lg font-medium">{project.title}</h3>
              <p className="text-fg-muted mt-2 text-sm">{project.stack.join(', ')}</p>
            </motion.div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  )
}

export default Projects
