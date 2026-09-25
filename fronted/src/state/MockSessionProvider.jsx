import { useEffect, useState } from 'react'
import { MockSessionContext } from './useMockSession.js'

export default function MockSessionProvider({ children }) {
  const [role, setRole] = useState('admin')
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <MockSessionContext.Provider value={{ role, setRole, theme, toggleTheme: () => setTheme(previous => previous === 'dark' ? 'light' : 'dark') }}>
      {children}
    </MockSessionContext.Provider>
  )
}
