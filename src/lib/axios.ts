import axios from 'axios'
import { env } from '@/env'

export const api = axios.create({
  // Garante que não use caminhos relativos puros se quebrar na nuvem
  baseURL: env.VITE_API_URL === '/' ? window.location.origin : env.VITE_API_URL,
  withCredentials: true, // Padrão do PizzaShop para envio de cookies dos mocks
})

if (env.VITE_ENABLED_API_DELAY) {
  api.interceptors.request.use(async (config) => {
    // Simulate API delay
    // config -> request config like headers, body, etc
    // await new Promise((resolve) => setTimeout(resolve, 2000))
    if (env.MODE !== 'test') {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 3000)) // random delay
    }

    return config
  })
}
