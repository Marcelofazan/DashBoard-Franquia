import axios, { AxiosError } from 'axios'
import { env } from '@/env'

export const api = axios.create({
  baseURL: env.VITE_API_URL === '/' ? window.location.origin : env.VITE_API_URL,
  withCredentials: true,
})

// Intercepta e responde nativamente no cliente se os mocks estiverem ativos
if (env.VITE_ENABLED_API_DELAY === true) {
  api.interceptors.request.use(async (config) => {
    try {
      const { worker } = await import('@/api/mocks')
      const handlers = worker.listHandlers()
      
      // Remove parâmetros de busca e garante a rota limpa (ex: /metrics/month-receipt)
      const targetUrl = config.url?.split('?')[0] || ''
      
      for (const handler of handlers) {
        const info = handler.info
        const path = typeof info.path === 'string' ? info.path : info.path.toString()
        
        // Valida se o método HTTP e a rota coincidem com o mock registrado
        if (path.includes(targetUrl) && info.method.toLowerCase() === config.method?.toLowerCase()) {
          const mockRequestUrl = window.location.origin + (config.url?.startsWith('/') ? config.url : `/${config.url}`)
          
          const resolverResponse = await handler.run({
            request: new Request(mockRequestUrl, { method: config.method?.toUpperCase() }),
          })
          
          if (resolverResponse?.response) {
            const json = await resolverResponse.response.json()
            
            // 💡 Força um curto-circuito seguro rejeitando a requisição com os dados do mock
            return Promise.reject({
              __isMockResponse: true,
              response: {
                data: json,
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
              }
            })
          }
        }
      }
    } catch (error) {
      // Se não for nossa resposta de mock controlada, repassa o erro adiante
      if (error && typeof error === 'object' && '__isMockResponse' in error) {
        return Promise.reject(error)
      }
    }
    
    return config
  })

  // Captura o curto-circuito do request e o transforma em um retorno de sucesso (200 OK)
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error && error.__isMockResponse) {
        return Promise.resolve(error.response)
      }
      return Promise.reject(error)
    }
  )
}
