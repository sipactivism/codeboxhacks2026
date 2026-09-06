import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { StrictMode } from 'react'
import { ThemeProvider } from './theme/ThemeProvider'

import "./styles/global.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
