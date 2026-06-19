import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createProject,
  deleteProjectImage,
  updateProject,
  uploadProjectImage,
  type Project,
  type ProjectInput,
} from '../lib/api'
import GlassPanel from '../components/GlassPanel'

interface ProjectFormProps {
  project: Project | null
  onClose: () => void
}

const statusOptions = [
  { value: 'en_desarrollo', label: 'En desarrollo' },
  { value: 'completado', label: 'Completado' },
  { value: 'pausado', label: 'Pausado' },
]

function ProjectForm({ project, onClose }: ProjectFormProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(project?.title ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [stack, setStack] = useState(project?.stack.join(', ') ?? '')
  const [status, setStatus] = useState(project?.status ?? 'en_desarrollo')
  const [displayOrder, setDisplayOrder] = useState(project?.display_order ?? 0)
  const [startDate, setStartDate] = useState(project?.start_date ?? '')
  const [endDate, setEndDate] = useState(project?.end_date ?? '')
  const [error, setError] = useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: (input: ProjectInput) =>
      project ? updateProject(project.id, input) : createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      onClose()
    },
    onError: () => setError('No se pudo guardar el proyecto'),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadProjectImage(project!.id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => deleteProjectImage(project!.id, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    saveMutation.mutate({
      title,
      description,
      stack: stack.split(',').map((item) => item.trim()).filter(Boolean),
      status,
      display_order: displayOrder,
      start_date: startDate || null,
      end_date: endDate || null,
    })
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      uploadMutation.mutate(file)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <GlassPanel className="w-full max-w-lg px-8 py-8">
        <h2 className="text-lg font-semibold text-white">
          {project ? 'Editar proyecto' : 'Nuevo proyecto'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Titulo"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none"
            required
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripcion"
            rows={4}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none"
            required
          />
          <input
            value={stack}
            onChange={(event) => setStack(event.target.value)}
            placeholder="Stack (separado por comas)"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-accent focus:outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-surface">
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-accent focus:outline-none"
            />
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-accent focus:outline-none"
            />
          </div>
          <input
            type="number"
            value={displayOrder}
            onChange={(event) => setDisplayOrder(Number(event.target.value))}
            placeholder="Orden"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none"
          />

          {project && (
            <div>
              <p className="text-sm text-neutral-400">Galeria</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.images.map((image) => (
                  <div key={image.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                    {image.s3_key.split('/').pop()}
                    <button
                      type="button"
                      onClick={() => deleteImageMutation.mutate(image.id)}
                      className="text-red-400"
                    >
                      Borrar
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="mt-3 text-sm text-neutral-300"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm text-neutral-300">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </GlassPanel>
    </div>
  )
}

export default ProjectForm
