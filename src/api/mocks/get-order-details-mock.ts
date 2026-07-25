import { http, HttpResponse } from 'msw'
import { GetOrderDetailsParams, GetOrderDetailsResponse } from '../get-order-details'

export const getOrderDetailsMockMock = http.get<
  GetOrderDetailsParams,
  never,
  GetOrderDetailsResponse
>('/orders/:orderId', ({ params }) => {
  const { orderId } = params

  const orderNumber = orderId.replace('order-', '')
  const index = Number(orderNumber) - 1

  const statuses = [
    'canceled',
    'delivered',
    'delivering',
    'pending',
    'processing',
  ] as const

  const currentStatus = statuses[index % statuses.length]

  return HttpResponse.json({
    id: orderId,
    customer: {
      name: `Customer ${orderNumber}`,
      email: `customer${orderNumber}@example.com`,
      phone: '123456789',
    },
    status: currentStatus,
    createdAt: new Date().toISOString(),
    totalInCents: 2400, // 👈 CORREÇÃO: 2400 centavos = R$ 24,00
    orderItems: [
      {
        id: 'order-item-1',
        priceInCents: 1200, // 👈 CORREÇÃO: 1200 centavos = R$ 12,00
        product: { name: 'Pizza Pepperoni' },
        quantity: 1, // 1 * R$ 12,00 = R$ 12,00
      },
      {
        id: 'order-item-2',
        priceInCents: 600, // 👈 CORREÇÃO: 600 centavos = R$ 6,00
        product: { name: 'Pizza Margherita' },
        quantity: 2, // 2 * R$ 6,00 = R$ 12,00
      },
    ],
  })
})