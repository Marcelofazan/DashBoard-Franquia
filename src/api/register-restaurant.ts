import { api } from '@/lib/axios'

export interface RegisterRestaurantBody {
  restaurantName: string
  managerName: string
  phone: string
  email: string
}

// Nesse padrão se cria um arquivo para cada função
export async function registerRestaurant({
  restaurantName,
  managerName,
  phone,
  email,
}: RegisterRestaurantBody) {
  await api.post('/restaurants', {
    restaurantName,
    managerName,
    phone,
    email,
  })
}
