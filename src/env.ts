import { z } from 'zod'

const envSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']),
  VITE_API_URL: z.string(), // 👈 Removido o .url() para aceitar "/"
  VITE_ENABLED_API_DELAY: z.coerce.boolean().default(false),
})

const _env = envSchema.safeParse({
  MODE: import.meta.env.MODE,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_ENABLED_API_DELAY: import.meta.env.VITE_ENABLED_API_DELAY,
})

if (_env.success === false) {
  console.error('❌ Invalid environment variables:', _env.error.format())
  throw new Error('Invalid environment variables.')
}

export const env = _env.data