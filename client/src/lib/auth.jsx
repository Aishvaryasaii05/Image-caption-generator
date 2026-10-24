import { createContext, useContext, useMemo } from 'react'
import { useAuth as useClerkAuth, useClerk, useUser } from '@clerk/react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth()
  const { user } = useUser()
  const { signOut } = useClerk()

  const value = useMemo(() => ({
    session: null,
    user: user || null,
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    getToken: () => getToken(),
    signOut: () => signOut(),
  }), [getToken, isLoaded, isSignedIn, signOut, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside AuthProvider')
  return auth
}

