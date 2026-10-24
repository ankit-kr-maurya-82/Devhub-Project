import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import { createSocketClient, resolveSocketOrigin, SOCKET_OPTIONS } from '../src/lib/socketConfig.js'
import { resolveApiBase } from '../src/lib/apiConfig.js'

describe('frontend API configuration', () => {
  it('uses the same-origin API path in development and production', () => {
    assert.equal(resolveApiBase(undefined), '/api/v1')
    assert.equal(resolveApiBase('/api/v1', true), '/api/v1')
    assert.equal(resolveApiBase('/api/v1/', true), '/api/v1')
  })

  it('requires HTTPS and the API root for absolute production URLs', () => {
    assert.equal(resolveApiBase('https://api.example.com/api/v1', true), 'https://api.example.com/api/v1')
    for (const value of [
      'http://api.example.com/api/v1',
      'https://api.example.com/other',
      'https://api.example.com/api/v1?query=1',
      '//api.example.com/api/v1',
    ]) {
      assert.throws(() => resolveApiBase(value, true), /HTTPS API root/)
    }
    assert.throws(() => resolveApiBase(undefined, true), /VITE_API_URL must be set/)
  })
})

describe('shared Socket.IO configuration', () => {
  it('uses the API origin for absolute URLs and same-origin defaults for relative URLs', () => {
    assert.equal(resolveSocketOrigin('https://api.example.com/api/v1'), 'https://api.example.com')
    assert.equal(resolveSocketOrigin('http://localhost:4000/api/v1'), 'http://localhost:4000')
    assert.equal(resolveSocketOrigin('/api/v1'), undefined)
    assert.equal(resolveSocketOrigin(undefined), undefined)
  })

  it('passes the shared path and credential options to the Socket.IO client', () => {
    let call
    const socket = { connected: false }
    const client = createSocketClient('https://api.example.com', (...args) => {
      call = args
      return socket
    })

    assert.equal(client, socket)
    assert.equal(call[0], 'https://api.example.com')
    assert.equal(call[1], SOCKET_OPTIONS)
    assert.deepEqual(call[1], { path: '/socket.io', withCredentials: true })
  })

  it('routes Community and Notifications through the same socket factory', async () => {
    const [community, notifications] = await Promise.all([
      readFile(new URL('../src/hooks/useSocket.js', import.meta.url), 'utf8'),
      readFile(new URL('../src/state/NotificationProvider.jsx', import.meta.url), 'utf8'),
    ])
    for (const source of [community, notifications]) {
      assert.match(source, /import \{ createSocketClient \} from ['"]\.\.\/lib\/socketConfig\.js['"]|import \{ createSocketClient \} from ['"]\.\/socketConfig\.js['"]|import \{ createSocketClient, resolveSocketOrigin \} from ['"]\.\/socketConfig\.js['"]/)
      assert.match(source, /createSocketClient\(socketOrigin\)/)
    }
  })
})
