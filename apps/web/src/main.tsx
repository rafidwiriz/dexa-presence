import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import './index.css'
import AbsensiLogin from './pages/absensi/Login'
import AbsensiLayout from './pages/absensi/AbsensiLayout'
import Absen from './pages/absensi/Absen'
import Profile from './pages/absensi/Profile'
import Summary from './pages/absensi/Summary'

function AbsensiApp() {
  const { user } = useAuth()
  if (!user) return <AbsensiLogin />
  return (
    <Routes>
      <Route element={<AbsensiLayout />}>
        <Route index element={<Absen />} />
        <Route path="absen" element={<Absen />} />
        <Route path="profil" element={<Profile />} />
        <Route path="summary" element={<Summary />} />
      </Route>
    </Routes>
  )
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
