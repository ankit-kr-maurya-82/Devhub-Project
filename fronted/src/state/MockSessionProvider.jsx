import { useEffect, useState } from 'react'
import { MockSessionContext } from './useMockSession.js'

export default function MockSessionProvider({ children }) {
  const [role, setRole] = useState('user')
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('devhub-theme') === 'dark' ? 'dark' : 'light' }
    catch { return 'light' }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('devhub-theme', theme) } catch { /* Theme still works when storage is unavailable. */ }
  }, [theme])

  return (
    <MockSessionContext.Provider value={{ role, setRole, theme, toggleTheme: () => setTheme(previous => previous === 'dark' ? 'light' : 'dark') }}>
      {children}
    </MockSessionContext.Provider>
  )
}
