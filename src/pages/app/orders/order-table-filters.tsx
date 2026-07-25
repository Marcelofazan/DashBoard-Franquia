import { zodResolver } from '@hookform/resolvers/zod'
import { Search, X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ordersFiltersSchema = z.object({
  orderId: z.string().optional(),
  customerName: z.string().optional(),
  status: z.string().optional(),
})

type OrdersFiltersSchema = z.infer<typeof ordersFiltersSchema>

export function OrderTableFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const orderId = searchParams.get('orderId') ?? ''
  const customerName = searchParams.get('customerName') ?? ''
  const status = searchParams.get('status') ?? 'all'

  const { register, handleSubmit, control, reset } =
    useForm<OrdersFiltersSchema>({
      resolver: zodResolver(ordersFiltersSchema),
      defaultValues: {
        orderId,
        customerName,
        status,
      },
    })

  function handleFilter({
    orderId,
    customerName,
    status,
  }: OrdersFiltersSchema) {
    setSearchParams((prevState) => {
      if (orderId) {
        prevState.set('orderId', orderId)
      } else {
        prevState.delete('orderId')
      }

      if (customerName) {
        prevState.set('customerName', customerName)
      } else {
        prevState.delete('customerName')
      }

      if (status) {
        prevState.set('status', status)
      } else {
        prevState.delete('status')
      }

      prevState.set('page', '1')

      return prevState
    })
  }

  function handleDeleteFilters() {
    setSearchParams((prevState) => {
      prevState.delete('orderId')
      prevState.delete('customerName')
      prevState.delete('status')
      prevState.set('page', '1')

      return prevState
    })

    // Correção: Garante que o estado interno do hook-form atualiza o Select
    reset({
      orderId: '',
      customerName: '',
      status: 'all',
    })
  }

  return (
    <form
      onSubmit={handleSubmit(handleFilter)}
      className="flex items-center gap-2"
    >
      <span className="text-sm font-semibold">Filtros:</span>
      <Input
        placeholder="ID do pedido"
        className="h-8 w-auto"
        {...register('orderId')}
      />
      <Input
        placeholder="Nome do cliente"
        className="h-8 w-[320px]"
        {...register('customerName')}
      />
      
      <Controller
        name="status"
        control={control}
        render={({ field: { name, onChange, value, disabled } }) => {
          return (
            <Select
              name={name}
              onValueChange={onChange}
              value={value} // 👈 Controla o valor dinamicamente pelo react-hook-form
              disabled={disabled}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
                <SelectItem value="processing">Em preparo</SelectItem>
                <SelectItem value="delivering">Em entrega</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
              </SelectContent>
            </Select>
          )
        }}
      />
      
      <Button type="submit" variant="secondary" size="xs">
        <Search className="mr-2 h-4 w-4" />
        Filtrar resultados
      </Button>
      <Button
        onClick={handleDeleteFilters}
        type="button"
        variant="outline"
        size="xs"
      >
        <X className="mr-2 h-4 w-4" />
        Remover filtros
      </Button>
    </form>
  )
}