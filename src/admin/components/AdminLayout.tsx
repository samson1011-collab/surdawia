import { Outlet } from 'react-router-dom'
import AdminNav from './AdminNav'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-ink">
      <AdminNav />
      <main className="flex-1 overflow-auto bg-chalk-off">
        <Outlet />
      </main>
    </div>
  )
}
