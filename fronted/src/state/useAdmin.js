import { createContext, useContext } from 'react'

export const AdminContext = createContext(null)

export function useAdmin() {
  const admin = useContext(AdminContext)
  if (!admin) throw new Error('useAdmin must be used inside AdminProvider')
  return admin
}
