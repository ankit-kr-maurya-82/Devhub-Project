import { useCallback, useEffect, useMemo, useState } from 'react'
import { MockSessionContext } from './useMockSession.js'
import api from '../lib/api.js'

export default function MockSessionProvider({ children }) {
  const [user, setUser] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('devhub-theme') === 'dark' ? 'dark' : 'light' }
    catch { return 'light' }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('devhub-theme', theme) } catch { /* Theme still works when storage is unavailable. */ }
  }, [theme])

  useEffect(() => {
    let active = true
    api.auth.me()
      .then(({ data }) => { if (active) setUser(data) })
      .catch(() => { if (active) setUser(null) })
      .finally(() => { if (active) setSessionLoading(false) })
    return () => { active = false }
  }, [])

  const login = useCallback(async credentials => {
    const result = await api.auth.login(credentials)
    setUser(result.user)
    return result.user
  }, [])
  const register = useCallback(async details => {
    const result = await api.auth.register(details)
    setUser(result.user)
    return result.user
  }, [])
  const logout = useCallback(async () => {
    await api.auth.logout()
    setUser(null)
  }, [])
  const updateProfile = useCallback(async profile => {
    const result = await api.users.updateProfile(profile)
    const updated = result.data
    setUser(current => ({ ...current, ...updated, id: String(updated._id || current?.id || current?._id) }))
    return updated
  }, [])
  const value = useMemo(() => ({
    user,
    role: user?.role || 'user',
    sessionLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshSession: async () => {
      try { const result = await api.auth.me(); setUser(result.data); return result.data }
      catch { setUser(null); return null }
    },
    theme,
    toggleTheme: () => setTheme(previous => previous === 'dark' ? 'light' : 'dark'),
  }), [user, sessionLoading, login, register, logout, updateProfile, theme])

  return (
    <MockSessionContext.Provider value={value}>
      {children}
    </MockSessionContext.Provider>
  )
}
