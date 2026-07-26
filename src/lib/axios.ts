import axios from 'axios'
import { env } from '@/env'
import { HttpHandler } from 'msw' // 💡 Importado para validação de tipo estrita

export const api = axios.create({
  baseURL: env.VITE_API_URL === '/' ? window.location.origin : env.VITE_API_URL,
  withCredentials: true,
})

interface MockShortCircuit {
  __isMockResponse: boolean
  response: {
    data: unknown
    status: number
    statusText: string
    headers: Record<string, string>
    config: unknown
  }
}

if (env.VITE_ENABLED_API_DELAY === true) {
  api.interceptors.request.use(async (config) => {
    try {
      const { worker } = await import('@/api/mocks')
      const handlers = worker.listHandlers()
      
      const targetUrl = config.url?.split('?') || ''
      
      for (const handler of handlers) {
        // 💡 Filtra garantindo que só leremos manipuladores HTTP, removendo o erro TS2339
        if (handler instanceof HttpHandler) {
          const info = handler.info
          const path = typeof info.path === 'string' ? info.path : info.path.toString()
          
          if (path.includes(targetUrl) && info.method.toLowerCase() === config.method?.toLowerCase()) {
            const mockRequestUrl = window.location.origin + (config.url?.startsWith('/') ? config.url : `/${config.url}`)
            const req = new Request(mockRequestUrl, { method: config.method?.toUpperCase() })
            
            const resolverResponse = await handler.resolver({
              request: req,
              params: {},
              cookies: {},
              requestId: Math.random().toString(36).substring(7)
            })
            
            if (resolverResponse) {
              const json = await resolverResponse.json()
              
              const mockResponse: MockShortCircuit = {
                __isMockResponse: true,
                response: {
                  data: json,
                  status: 200,
                  statusText: 'OK',
                  headers: {},
                  config,
                }
              }
              
              return Promise.reject(mockResponse)
            }
          }
        }
      }
    } catch (error) {
      if (error && typeof error === 'object' && '__isMockResponse' in error) {
        return Promise.reject(error)
      }
    }
    
    return config
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error && (error as MockShortCircuit).__isMockResponse) {
        return Promise.resolve((error as MockShortCircuit).response)
      }
      return Promise.reject(error)
    }
  )
}
