import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

const links = [
  { to: '/monitoring/employees', label: 'Karyawan' },
  { to: '/monitoring/attendance', label: 'Absensi' },
]

export default function MonitoringLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-2">
          <div className="font-bold text-slate-800">Monitoring HRD</div>
          <nav className="flex gap-2 overflow-x-auto">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-slate-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-500 hover:underline">Keluar</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4"><Outlet /></main>
    </div>
  )
}
