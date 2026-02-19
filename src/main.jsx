import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import PhonePage from './pages/PhonePage'
import LaptopPage from './pages/LaptopPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/phone/:roomId" element={<PhonePage />} />
        <Route path="/laptop/:roomId" element={<LaptopPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
