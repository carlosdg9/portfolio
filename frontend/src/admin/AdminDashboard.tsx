import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteProject, fetchProjects, type Project } from '../lib/api'
import { clearToken } from '../lib/auth'
import GlassPanel from '../components/GlassPanel'
import ProjectForm from './ProjectForm'

interface AdminDashboardProps {
  onLogout: () => void
}

function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const queryClient = useQueryClient()
  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects })
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  function handleLogout() {
    clearToken()
    onLogout()
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Administrar proyectos</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreating(true)}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          >
            Nuevo proyecto
          </button>
          <button onClick={handleLogout} className="rounded-full px-4 py-2 text-sm text-neutral-300">
            Salir
          </button>
        </div>
      </div>

      {isLoading && <p className="mt-8 text-neutral-400">Cargando...</p>}

      <div className="mt-8 flex flex-col gap-4">
        {projects?.map((project) => (
          <GlassPanel key={project.id} className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-base font-medium text-white">{project.title}</h2>
              <p className="text-sm text-neutral-400">{project.stack.join(', ')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingProject(project)} className="text-sm text-accent">
                Editar
              </button>
              <button
                onClick={() => deleteMutation.mutate(project.id)}
                className="text-sm text-red-400"
              >
                Borrar
              </button>
            </div>
          </GlassPanel>
        ))}
      </div>

      {(isCreating || editingProject) && (
        <ProjectForm
          project={editingProject}
          onClose={() => {
            setIsCreating(false)
            setEditingProject(null)
          }}
        />
      )}
    </div>
  )
}

export default AdminDashboard
