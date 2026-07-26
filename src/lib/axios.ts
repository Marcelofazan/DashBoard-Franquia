import axios from 'axios'
import { env } from '@/env'
import { getResponse } from 'msw' // 💡 Função oficial para capturar respostas dos handlers

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
      
      // Constrói a URL absoluta que o Axios simularia no navegador
      const mockRequestUrl = window.location.origin + (config.url?.startsWith('/') ? config.url : `/${config.url}`)
      
      // Cria um objeto nativo Request padronizado para o MSW processar
      const req = new Request(mockRequestUrl, { 
        method: config.method?.toUpperCase(),
        headers: new Headers(config.headers as Record<string, string>),
      })
      
      // 💡 O getResponse alimenta a lista de handlers e devolve a Response simulada nativamente
      const mockedResponse = await getResponse(handlers, req)
      
      if (mockedResponse) {
        const json = await mockedResponse.json()
        
        const mockResponse: MockShortCircuit = {
          __isMockResponse: true,
          response: {
            data: json,
            status: mockedResponse.status,
            statusText: mockedResponse.statusText,
            headers: {},
            config,
          }
        }
        
        return Promise.reject(mockResponse)
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
