import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import './index.css'

function AbsensiApp() {
  return <h1 className="p-4 text-xl font-bold">Absensi App</h1>
}

function MonitoringApp() {
  return <h1 className="p-4 text-xl font-bold">Monitoring App</h1>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/absensi/*" element={<AbsensiApp />} />
          <Route path="/monitoring/*" element={<MonitoringApp />} />
          <Route path="*" element={<div className="p-4">404 — pick an app</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
