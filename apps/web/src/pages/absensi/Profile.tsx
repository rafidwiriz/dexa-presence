import { useAuth } from "../../lib/auth"
import { API_BASE } from "../../lib/api"

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const API_ORIGIN = API_BASE.replace(/\/api$/, '')

  if (!user) return null

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Profil Karyawan</h1>

      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-3">
        {user.photo_url ? (
          <img
            src={`${API_ORIGIN}${user.photo_url}`}
            alt="Foto Profil"
            className="h-28 w-28 rounded-full object-cover"
          />
        ) : (
          <div className="h-28 w-28 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-4xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <div className="text-lg font-bold text-slate-800">{user.name}</div>
          <div className="text-sm text-slate-500">{user.position}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow divide-y divide-slate-100">
        <DetailRow label="Email Perusahaan" value={user.company_email} />
        <DetailRow label="Posisi" value={user.position} />
        <DetailRow label="Nomor Handphone" value={user.phone ?? 'Belum diisi'} />
      </div>
    </div>
  )
}
