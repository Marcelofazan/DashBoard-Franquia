import { setupWorker } from 'msw/browser'

import { env } from '@/env'

import { approveOrderMock } from './approve-order-mock'
import { cancelOrderMock } from './cancel-order-mock'
import { deliverOrderMock } from './deliver-order-mock'
import { dispatchOrderMock } from './dispatch-order-mock'
import { getDailyRevenueInPeriodMock } from './get-daily-revenue-in-period-mock'
import { getDayOrdersAmountMock } from './get-day-orders-amount-mock'
import { getManagedRestaurantMock } from './get-managed-restaurant-mock'
import { getMonthCanceledOrdersAmountMock } from './get-month-canceled-orders-amount-mock'
import { getMonthOrdersAmountMock } from './get-month-orders-amount-mock'
import { getMonthRevenueMock } from './get-month-revenue-orders-amount-mock'
import { getOrderDetailsMockMock } from './get-order-details-mock'
import { getOrdersMock } from './get-orders-mock'
import { getPopularProductsMock } from './get-popular-products-mock'
import { getProfileMock } from './get-profile-mock'
import { registerRestaurantMock } from './register-restaurant-mock'
import { signInMock } from './sign-in-mock'
import { updateProfileMock } from './update-profile-mock'

export const worker = setupWorker(
  approveOrderMock,
  cancelOrderMock,
  deliverOrderMock,
  dispatchOrderMock,
  getDailyRevenueInPeriodMock,
  getDayOrdersAmountMock,
  getManagedRestaurantMock,
  getMonthCanceledOrdersAmountMock,
  getMonthOrdersAmountMock,
  getMonthRevenueMock,
  getOrderDetailsMockMock,
  getOrdersMock,
  getPopularProductsMock,
  getProfileMock,
  registerRestaurantMock,
  signInMock,
  updateProfileMock,
)

export async function enableMSW() {
  // Permite rodar se for modo de teste, desenvolvimento OU se o delay estiver ativado (booleano)
  if (
    env.MODE !== 'test' && 
    env.MODE !== 'development' && 
    env.VITE_ENABLED_API_DELAY !== true // 💡 Removidas as aspas aqui!
  ) {
    return
  }

  await worker.start({
    onUnhandledRequest: 'bypass', 
    serviceWorker: {
      url: '/mockServiceWorker.js',
    }
  })
}
