import React from 'react'
import ReactDOM from 'react-dom/client'

import { App } from './App' // 💡 Removido o .tsx
import { enableMSW } from './api/mocks' // 💡 Removido o /index.ts

enableMSW().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
