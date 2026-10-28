import { io } from 'socket.io-client'

export const SOCKET_OPTIONS = Object.freeze({
  path: '/socket.io',
  withCredentials: true,
})

export function resolveSocketOrigin(apiBase) {
  if (!/^https?:\/\//i.test(apiBase || '')) return undefined
  const parsed = new URL(apiBase)
  if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') return undefined
  return ['http:', 'https:'].includes(parsed.protocol) ? parsed.origin : undefined
}

export function createSocketClient(origin, socketFactory = io) {
  return socketFactory(origin, { ...SOCKET_OPTIONS })
}
