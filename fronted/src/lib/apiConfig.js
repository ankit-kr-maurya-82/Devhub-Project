const productionApiUrlError = 'Production VITE_API_URL must be an HTTPS API root ending in /api/v1 or /api/v1 for a same-origin proxy.'

export function resolveApiBase(configuredApiBase, production = false) {
  const apiBase = typeof configuredApiBase === 'string' ? configuredApiBase.trim() : ''

  if (!apiBase) {
    if (production) {
      throw new Error('VITE_API_URL must be set to the production API root ending in /api/v1.')
    }
    return '/api/v1'
  }

  if (production && !/^\/api\/v1\/?$/.test(apiBase)) {
    let parsedApiBase
    try {
      parsedApiBase = new URL(apiBase)
    } catch {
      throw new Error(productionApiUrlError)
    }
    if (
      parsedApiBase.protocol !== 'https:' ||
      parsedApiBase.pathname.replace(/\/$/, '') !== '/api/v1' ||
      parsedApiBase.search ||
      parsedApiBase.hash ||
      parsedApiBase.username ||
      parsedApiBase.password
    ) {
      throw new Error(productionApiUrlError)
    }
  }

  return apiBase.replace(/\/$/, '')
}
