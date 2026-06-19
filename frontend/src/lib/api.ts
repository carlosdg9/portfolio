import { getToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL

export interface ProjectImage {
  id: number
  s3_key: string
  display_order: number
}

export interface Project {
  id: number
  title: string
  description: string
  stack: string[]
  status: string
  display_order: number
  start_date: string | null
  end_date: string | null
  images: ProjectImage[]
}

export interface ProjectInput {
  title: string
  description: string
  stack: string[]
  status: string
  display_order: number
  start_date: string | null
  end_date: string | null
}

class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!response.ok) {
    throw new ApiError(`Error en la peticion: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export function fetchProjects(): Promise<Project[]> {
  return request('/projects')
}

export function fetchProject(id: number): Promise<Project> {
  return request(`/projects/${id}`)
}

export async function login(username: string, password: string): Promise<string> {
  const body = new URLSearchParams({ username, password })
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    throw new ApiError('Usuario o contrasena incorrectos')
  }

  const data = await response.json()
  return data.access_token
}

export function createProject(input: ProjectInput): Promise<Project> {
  return request('/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function updateProject(id: number, input: Partial<ProjectInput>): Promise<Project> {
  return request(`/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function deleteProject(id: number): Promise<void> {
  return request(`/projects/${id}`, { method: 'DELETE' })
}

export function uploadProjectImage(projectId: number, file: File): Promise<ProjectImage> {
  const formData = new FormData()
  formData.append('file', file)
  return request(`/projects/${projectId}/images`, { method: 'POST', body: formData })
}

export function deleteProjectImage(projectId: number, imageId: number): Promise<void> {
  return request(`/projects/${projectId}/images/${imageId}`, { method: 'DELETE' })
}
