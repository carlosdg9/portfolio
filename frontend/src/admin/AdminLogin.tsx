import { useState } from 'react'
import { login } from '../lib/api'
import { setToken } from '../lib/auth'
import GlassPanel from '../components/GlassPanel'

interface AdminLoginProps {
  onSuccess: () => void
}

function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const token = await login(username, password)
      setToken(token)
      onSuccess()
    } catch {
      setError('Usuario o contrasena incorrectos')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <GlassPanel className="w-full max-w-sm px-8 py-10">
        <h1 className="text-xl font-semibold text-white">Acceso administrador</h1>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Usuario"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Contrasena"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none"
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </GlassPanel>
    </div>
  )
}

export default AdminLogin
