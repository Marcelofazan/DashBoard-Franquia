import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, Search, X } from 'lucide-react'
import { useState } from 'react'

import { approveOrder } from '@/api/approve-order'
import { cancelOrder } from '@/api/cancel-order'
import { deliverOrder } from '@/api/deliver-order'
import { dispatchOrder } from '@/api/dispatch-order'
import { GetOrdersResponse } from '@/api/get-orders'
import { GetOrderDetailsResponse } from '@/api/get-order-details' // 👈 Importação necessária para o cache do modal
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'

import { OrderDetails } from './order-details'
import { OrderStatus } from './order-status'

// Definição exata do tipo de status aceito pela API
type OrderStatusType = 'pending' | 'canceled' | 'processing' | 'delivering' | 'delivered'

interface OrderTableRowProps {
  order: {
    orderId: string
    createdAt: string
    status: OrderStatusType
    customerName: string
    total: number
  }
}

export function OrderTableRow({ order }: OrderTableRowProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const queryClient = useQueryClient()

  function updateOrderStatusOnCache(orderId: string, status: OrderStatusType) {
    // 1. Atualiza a lista geral de pedidos no cache
    const ordersListCache = queryClient.getQueriesData<GetOrdersResponse>({
      queryKey: ['orders'],
    })

    ordersListCache?.forEach(([cacheKey, cacheData]) => {
      if (!cacheData) return

      queryClient.setQueryData<GetOrdersResponse>(cacheKey, {
        ...cacheData,
        orders: cacheData.orders.map((item) => {
          if (item.orderId === orderId) {
            return { ...item, status }
          }
          return item
        }),
      })
    })

    // 2. Correção de indexação: Atualiza também o cache individual da modal de detalhes
    queryClient.setQueryData<GetOrderDetailsResponse>(['order', orderId], (oldData) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        status,
      }
    })
  }

  const { mutateAsync: cancelOrderFn, isPending: isCancelOrderPending } =
    useMutation({
      mutationFn: cancelOrder,
      async onSuccess(_, { orderId }) {
        updateOrderStatusOnCache(orderId, 'canceled')
      },
    })

  const { mutateAsync: approveOrderFn, isPending: isApproveOrderPending } =
    useMutation({
      mutationFn: approveOrder,
      async onSuccess(_, { orderId }) {
        updateOrderStatusOnCache(orderId, 'processing')
      },
    })

  const { mutateAsync: deliverOrderFn, isPending: isDeliverOrderPending } =
    useMutation({
      mutationFn: deliverOrder,
      async onSuccess(_, { orderId }) {
        updateOrderStatusOnCache(orderId, 'delivered')
      },
    })

  const { mutateAsync: dispatchOrderFn, isPending: isDispatchOrderPending } =
    useMutation({
      mutationFn: dispatchOrder,
      async onSuccess(_, { orderId }) {
        updateOrderStatusOnCache(orderId, 'delivering')
      },
    })

  return (
    <TableRow>
      <TableCell>
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="xs">
              <Search className="h-3 w-3" />
              <span className="sr-only">Detalhes do pedido</span>
            </Button>
          </DialogTrigger>
          <OrderDetails orderId={order.orderId} open={isDetailsOpen} />
        </Dialog>
      </TableCell>
      <TableCell className="font-mono text-xs font-medium">
        {order.orderId}
      </TableCell>
      <TableCell>
        {formatDistanceToNow(new Date(order.createdAt), {
          addSuffix: true,
          locale: ptBR,
        })}
      </TableCell>
      <TableCell>
        <OrderStatus status={order.status} />
      </TableCell>
      <TableCell className="font-medium">{order.customerName}</TableCell>
      <TableCell>
        {(order.total / 100).toLocaleString('pt-BR', { // 👈 Transforma centavos da API/Mock para Real real se necessário
          style: 'currency',
          currency: 'BRL',
        })}
      </TableCell>
      <TableCell>
        {order.status === 'pending' && (
          <Button
            disabled={isApproveOrderPending}
            onClick={() => approveOrderFn({ orderId: order.orderId })}
            variant="outline"
            size="xs"
          >
            <ArrowRight className="mr-2 h-3 w-3" />
            Aprovar
          </Button>
        )}
        {order.status === 'processing' && (
          <Button
            disabled={isDispatchOrderPending}
            onClick={() => dispatchOrderFn({ orderId: order.orderId })}
            variant="outline"
            size="xs"
          >
            <ArrowRight className="mr-2 h-3 w-3" />
            Em entrega
          </Button>
        )}
        {order.status === 'delivering' && (
          <Button
            disabled={isDeliverOrderPending}
            onClick={() => deliverOrderFn({ orderId: order.orderId })}
            variant="outline"
            size="xs"
          >
            <ArrowRight className="mr-2 h-3 w-3" />
            Entregue
          </Button>
        )}
      </TableCell>
      <TableCell>
        <Button
          disabled={
            !['pending', 'processing'].includes(order.status) ||
            isCancelOrderPending
          }
          variant="ghost"
          size="xs"
          onClick={() => cancelOrderFn({ orderId: order.orderId })}
        >
          <X className="mr-2 h-3 w-3" />
          Cancelar
        </Button>
      </TableCell>
    </TableRow>
  )
}