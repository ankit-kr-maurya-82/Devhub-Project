import { io } from 'socket.io-client'

export const SOCKET_OPTIONS = Object.freeze({
  path: '/socket.io',
  withCredentials: true,
})

export function resolveSocketOrigin(apiBase) {
  if (!/^https?:\/\//i.test(apiBase || '')) return undefined
  const parsed = new URL(apiBase)
  return ['http:', 'https:'].includes(parsed.protocol) ? parsed.origin : undefined
}

export function createSocketClient(origin, socketFactory = io) {
  return socketFactory(origin, SOCKET_OPTIONS)
}
