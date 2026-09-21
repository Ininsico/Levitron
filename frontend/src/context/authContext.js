import { createContext } from 'react'

/**
 * Kept in its own module so both the provider and the hook can import it
 * without either file exporting a mix of components and functions (which
 * breaks React Fast Refresh).
 */
export const AuthContext = createContext(null)
