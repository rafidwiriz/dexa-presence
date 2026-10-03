import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { AttendanceSummaryRow } from '../../lib/types'

const TZ = 'Asia/Jakarta'

function todayInTz(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}
function monthStartInTz(): string {
  return `${todayInTz().slice(0, 8)}01`
}

function formatDate(d: string): string {
  const [y, m, day] = d.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}
function formatTime(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: TZ })
    : '—'
}

export default function Summary() {
  const [from, setFrom] = useState(monthStartInTz)
  const [to, setTo] = useState(todayInTz)
  const [rows, setRows] = useState<AttendanceSummaryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'err'; text: string } | null>(null)

  const load = async (f: string, t: string) => {
    setLoading(true)
    setMsg(null)
    try {
      setRows(await api.getSummary(f, t))
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Gagal memuat data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(from, to) }, []) // initial: month start → today

  const applyFilter = () => load(from, to)
  const invalid = to < from

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Summary Absen</h1>

      <div className="bg-white rounded-2xl shadow p-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Dari</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Sampai</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </label>
        <button
          onClick={applyFilter}
          disabled={loading || invalid}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
        >
          Terapkan
        </button>
      </div>

      {msg && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{msg.text}</div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Tanggal</th>
              <th className="text-left px-4 py-3">Masuk</th>
              <th className="text-left px-4 py-3">Pulang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.date}>
                <td className="px-4 py-3">{formatDate(r.date)}</td>
                <td className="px-4 py-3">{formatTime(r.check_in)}</td>
                <td className="px-4 py-3">{formatTime(r.check_out)}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  Belum ada data absensi pada rentang ini
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
