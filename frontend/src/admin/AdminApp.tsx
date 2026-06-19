import { useState } from 'react'
import { getToken } from '../lib/auth'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import BackgroundGlow from '../components/BackgroundGlow'

function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()))

  return (
    <div className="min-h-screen">
      <BackgroundGlow />
      {isAuthenticated ? (
        <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <AdminLogin onSuccess={() => setIsAuthenticated(true)} />
      )}
    </div>
  )
}

export default AdminApp
