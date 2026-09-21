import { useCallback, useMemo, useState } from 'react'

import { AuthContext } from './authContext.js'
import { getCurrentUser, loginAccount, registerAccount } from '../lib/api.js'
import { clearSession, readSession, writeSession } from '../lib/session.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())

  const persist = useCallback((next) => {
    writeSession(next)
    setSession(next)

    return next.user
  }, [])

  const signIn = useCallback(
    async (credentials) => persist(await loginAccount(credentials)),
    [persist],
  )

  const signUp = useCallback(async (details) => persist(await registerAccount(details)), [persist])

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const refresh = useCallback(async () => {
    try {
      return persist({ ...readSession(), user: await getCurrentUser() })
    } catch (error) {
      // An expired or revoked token should drop the user back to a signed-out
      // state, so guarded routes redirect to /login instead of showing an error.
      if (error.status === 401) {
        clearSession()
        setSession(null)
      }

      throw error
    }
  }, [persist])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      signIn,
      signUp,
      signOut,
      refresh,
    }),
    [session, signIn, signUp, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
