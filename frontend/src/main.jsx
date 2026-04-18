import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import qcLogo from './assets/img/Quezon City Government Logo.png'

const favicon = document.querySelector('link[rel="icon"]') || (() => {
  const link = document.createElement('link')
  link.rel = 'icon'
  document.head.appendChild(link)
  return link
})()

favicon.type = 'image/png'
favicon.href = qcLogo

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


