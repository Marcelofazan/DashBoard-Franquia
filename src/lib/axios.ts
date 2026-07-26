import axios from 'axios'
import { env } from '@/env'
import { getResponse, HttpHandler } from 'msw'

const baseURL = env.VITE_API_URL === '/' 
  ? (typeof window !== 'undefined' ? window.location.origin : '') 
  : env.VITE_API_URL

export const api = axios.create({
  baseURL,
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
      
      const httpHandlers = handlers.filter(
        (handler): handler is HttpHandler => handler instanceof HttpHandler
      )
      
      // 💡 CORREÇÃO DEFINITIVA: Usa o Axios para gerar a URL exata com as Query Strings (?from=...&to=...)
      const fullPathWithParams = api.getUri(config)
      
      // Garante a formatação correta do caminho inicial com barra '/'
      const cleanPath = fullPathWithParams.startsWith('/') ? fullPathWithParams : `/${fullPathWithParams}`
      
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
      const mockRequestUrl = new URL(cleanPath, currentOrigin).toString()
      
      const requestHeaders = new Headers()
      if (config.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            requestHeaders.append(key, String(value))
          }
        })
      }
      
      const req = new Request(mockRequestUrl, { 
        method: config.method?.toUpperCase(),
        headers: requestHeaders,
      })
      
      const mockedResponse = await getResponse(httpHandlers, req)
      
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
