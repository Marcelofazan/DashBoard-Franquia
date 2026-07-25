import { api } from '@/lib/axios'

export interface UpdateProfileBody {
  name: string
  description: string | null
}

export async function updateProfile({ name, description }: UpdateProfileBody) {
  // descomente para testar o fluxo de erro
  // await new Promise((resolve, reject) => setTimeout(reject, 1000))

  await api.put('/profile', { name, description })
}
