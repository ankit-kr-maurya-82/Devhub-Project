import { createContext, useContext } from 'react'

export const MockSessionContext = createContext(null)

export function useMockSession() {
  const session = useContext(MockSessionContext)
  if (!session) throw new Error('useMockSession must be used inside MockSessionProvider')
  return session
}
