import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { AttendanceRecord } from '../../lib/types'

const TZ = 'Asia/Jakarta'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: TZ,
  })
}

export default function Attendance() {
  const [rows, setRows] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'err'; text: string } | null>(null)

  const load = async () => {
    setLoading(true)
    setMsg(null)
    try {
      setRows(await api.listAttendance())
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Gagal memuat data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Data Absensi</h1>

      {msg && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{msg.text}</div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Karyawan</th>
              <th className="text-left px-4 py-3">Tanggal & Waktu</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{r.employee?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{formatDateTime(r.check_at)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.check_type === 'in'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {r.check_type === 'in' ? 'Masuk' : 'Pulang'}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  Belum ada data absensi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
