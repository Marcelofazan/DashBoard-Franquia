import { api } from '@/lib/axios'

export type GetPopularProductsResponse = {
  amount: number
  product: string
}[]

export async function getPopularProducts() {
  const response = await api.get<GetPopularProductsResponse>(
    '/metrics/popular-products',
  )

  return response.data
}
