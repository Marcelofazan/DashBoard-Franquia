import axios from 'axios'

import { env } from '@/env'

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true, // enable cookies to be sent with requests
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
