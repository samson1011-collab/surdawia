import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Invalid email or password.')
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background: subtle flag stripe along the top */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-red" />
        <div className="flex-1 bg-chalk" />
        <div className="flex-1 bg-green" />
        <div className="flex-1 bg-ink border-t border-white/10" />
      </div>

      {/* Faint radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(206,17,38,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-white/10 bg-white/5 mb-5">
            {/* Olive branch / humanitarian mark */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="10" stroke="#CE1126" strokeWidth="1.5" opacity="0.6"/>
              <path d="M14 8v12M9 11l5 3 5-3" stroke="#007A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl text-chalk tracking-tight">Admin Portal</h1>
          <p className="font-sans text-sm text-white/40 mt-1">Relief Organization</p>
        </div>

        {/* Card */}
        <div className="bg-ink-mid border border-white/8 rounded-2xl p-8 shadow-2xl animate-fade-up delay-100"
          style={{ animationFillMode: 'forwards' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-sans text-xs text-white/40 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-chalk placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-red/50 transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block font-sans text-xs text-white/40 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-chalk placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-red/50 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="font-sans text-sm text-red-light bg-red/10 border border-red/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red hover:bg-red-light disabled:opacity-50 text-chalk font-sans font-medium text-sm rounded-xl px-4 py-3 transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 font-sans text-xs text-white/25">
          <a href="/" className="hover:text-white/50 transition-colors">← Back to public site</a>
        </p>
      </div>
    </div>
  )
}
