import { Navigate, useLocation } from 'react-router-dom'
import { useMockSession } from '../state/useMockSession.js'

export default function RequireAuth({ children }) {
  const { user, sessionLoading } = useMockSession()
  const location = useLocation()
  if (sessionLoading) return <p role="status" className="mx-auto max-w-3xl p-8 text-sm text-[var(--muted)]">Checking your session…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return children
}
