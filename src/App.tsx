import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/auth/AuthContext'

// Layouts
import PublicLayout from '@/public-site/components/PublicLayout'
import AdminLayout from '@/admin/components/AdminLayout'
import ProtectedRoute from '@/admin/components/ProtectedRoute'

// Auth
import LoginPage from '@/auth/LoginPage'

// Public pages
import Home from '@/public-site/pages/Home'
import Donate from '@/public-site/pages/Donate'
import Gallery from '@/public-site/pages/Gallery'
import Timeline from '@/public-site/pages/Timeline'
import GratitudeWall from '@/public-site/pages/GratitudeWall'
import Store from '@/public-site/pages/Store'
import About from '@/public-site/pages/About'

// Admin pages
import Dashboard from '@/admin/pages/Dashboard'
import DonationManager from '@/admin/pages/DonationManager'
import MediaManager from '@/admin/pages/MediaManager'
import GratitudeVideos from '@/admin/pages/GratitudeVideos'
import StoreManager from '@/admin/pages/StoreManager'
import WebsiteCMS from '@/admin/pages/WebsiteCMS'
import Settings from '@/admin/pages/Settings'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public site ───────────────────────────────── */}
            <Route element={<PublicLayout />}>
              <Route path="/"          element={<Home />} />
              <Route path="/donate"    element={<Donate />} />
              <Route path="/gallery"   element={<Gallery />} />
              <Route path="/timeline"  element={<Timeline />} />
              <Route path="/gratitude" element={<GratitudeWall />} />
              <Route path="/store"     element={<Store />} />
              <Route path="/about"     element={<About />} />
            </Route>

            {/* ── Auth ──────────────────────────────────────── */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* ── Admin portal (protected) ──────────────────── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index                  element={<Dashboard />} />
              <Route path="donations"       element={<DonationManager />} />
              <Route path="media"           element={<MediaManager />} />
              <Route path="gratitude"       element={<GratitudeVideos />} />
              <Route path="store"           element={<StoreManager />} />
              <Route path="website"         element={<WebsiteCMS />} />
              <Route path="settings"        element={<Settings />} />
            </Route>

            {/* ── Fallback ──────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
