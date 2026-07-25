import { api } from '@/lib/axios'

export interface SignInBody {
  email: string
}

// Nesse padrão se cria um arquivo para cada função
export async function signIn({ email }: SignInBody) {
  await api.post('/authenticate', { email })
}
