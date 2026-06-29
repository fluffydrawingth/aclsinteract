import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initImageStore } from './lib/imageStore'

// Warm the image cache from IndexedDB before first render so components
// can read images synchronously via getImage().
initImageStore().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
