import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

const links = [
  { to: '/absensi/absen', label: 'Absen' },
  { to: '/absensi/profil', label: 'Profil' },
  { to: '/absensi/summary', label: 'Summary' },
]

export default function AbsensiLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-2">
          <div className="font-bold text-slate-800">Absensi WFH</div>
          <nav className="flex gap-2 overflow-x-auto">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    isActive ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-slate-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-500 hover:underline">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        <Outlet />
      </main>
    </div>
  )
}
