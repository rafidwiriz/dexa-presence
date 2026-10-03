/* eslint-disable react-refresh/only-export-components */
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
import MonitoringLogin from './pages/monitoring/MonitoringLogin'
import MonitoringLayout from './pages/monitoring/MonitoringLayout'
import Employees from './pages/monitoring/Employees'
import Attendance from './pages/monitoring/Attendance'

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
  const { user, logout } = useAuth()
  if (!user) return <MonitoringLogin />
  if (user.role !== 'admin') {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <div className="text-xl font-bold text-slate-800">Akses ditolak</div>
            <p className="text-sm text-slate-500 mt-2">Halaman ini khusus admin.</p>
            <div className="mt-6 flex gap-3 justify-center">
              <a
                href="/absensi/absen"
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Kembali ke Absensi
              </a>
              <button
                onClick={logout}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )
  }
  return (
    <Routes>
      <Route element={<MonitoringLayout />}>
        <Route index element={<Employees />} />
        <Route path="employees" element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
      </Route>
    </Routes>
  )
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
