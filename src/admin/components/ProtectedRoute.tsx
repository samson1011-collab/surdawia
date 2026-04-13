import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, rolesLoaded, isAdmin } = useAuth()

  if (loading || (user && !rolesLoaded)) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-red rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}
