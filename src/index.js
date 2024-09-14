import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'normalize.css'
import { LocalStorageProvider } from './providers/localStorageProvider'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <LocalStorageProvider>
      <App />
    </LocalStorageProvider>
  </React.StrictMode>
)
