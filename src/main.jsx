import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import PhonePage from './pages/PhonePage'
import LaptopPage from './pages/LaptopPage'

// FIX: Removed StrictMode — it double-mounts components which causes Ably
// to subscribe/unsubscribe/resubscribe, dropping initial messages.
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/phone/:roomId" element={<PhonePage />} />
      <Route path="/laptop/:roomId" element={<LaptopPage />} />
    </Routes>
  </BrowserRouter>
)