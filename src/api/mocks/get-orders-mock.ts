import { http, HttpResponse } from 'msw'
import type { GetOrdersResponse } from '../get-orders'

type Orders = GetOrdersResponse['orders']
type OrdersStatus = GetOrdersResponse['orders'][number]['status']

const statuses: OrdersStatus[] = [
  'canceled',
  'delivered',
  'delivering',
  'pending',
  'processing',
]

// Gera 60 pedidos fictícios na memória do MSW
const orders: Orders = Array.from({ length: 60 }).map((_, index) => ({
  orderId: `order-${index + 1}`,
  customerName: `Customer ${index + 1}`,
  createdAt: new Date().toISOString(),
  total: 2400,
  status: statuses[index % statuses.length],
}))

export const getOrdersMock = http.get<never, never, GetOrdersResponse>(
  '/orders',
  async ({ request }) => {
    const { searchParams } = new URL(request.url)

    const pageIndex = searchParams.get('pageIndex')
      ? Number(searchParams.get('pageIndex'))
      : 0

    const customerName = searchParams.get('customerName')
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')

    let filteredOrders = orders

    // Correção: Filtro insensível a maiúsculas/minúsculas
    if (customerName) {
      filteredOrders = filteredOrders.filter((order) =>
        order.customerName.toLowerCase().includes(customerName.toLowerCase()),
      )
    }

    if (orderId) {
      filteredOrders = filteredOrders.filter((order) =>
        order.orderId.toLowerCase().includes(orderId.toLowerCase()),
      )
    }

    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter((order) => order.status === status)
    }

    const perPage = 10
    const paginatedOrders = filteredOrders.slice(
      pageIndex * perPage,
      (pageIndex + 1) * perPage,
    )

    return HttpResponse.json({
      orders: paginatedOrders,
      meta: {
        pageIndex,
        perPage,
        totalCount: filteredOrders.length,
      },
    })
  },
)