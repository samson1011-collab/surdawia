import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { AppRole, UserProfile } from '@/types'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  role: AppRole | null
  loading: boolean
  rolesLoaded: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<User | null>(null)
  const [session, setSession]     = useState<Session | null>(null)
  const [profile, setProfile]     = useState<UserProfile | null>(null)
  const [role, setRole]           = useState<AppRole | null>(null)
  const [loading, setLoading]     = useState(true)
  const [rolesLoaded, setRolesLoaded] = useState(false)

  async function fetchUserData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      setProfile(data as UserProfile)
      setRole((data as UserProfile).role)
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
    } finally {
      setRolesLoaded(true)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setLoading(false)
        setRolesLoaded(true)
      }
    })

    // Listen for auth changes — only fetch profile on SIGNED_IN (not INITIAL_SESSION)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN' && session?.user) {
        setRolesLoaded(false)
        fetchUserData(session.user.id)
      }

      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setRole(null)
        setRolesLoaded(true)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const isAdmin = role === 'admin' || role === 'super_admin'

  return (
    <AuthContext.Provider value={{
      user, session, profile, role,
      loading, rolesLoaded,
      isAdmin,
      signIn, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
