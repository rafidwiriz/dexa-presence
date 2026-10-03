import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { AttendanceSummaryRow } from '../../lib/types'

function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
}

export default function Absen() {
  const [row, setRow] = useState<AttendanceSummaryRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const today = todayStr()

  const loadToday = async () => {
    try {
      const rows = await api.getSummary(today, today)
      setRow(rows[0] ?? null)
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Gagal memuat absensi' })
    }
  }

  useEffect(() => { loadToday() }, [today])

  const doCheck = async (check_type: 'in' | 'out') => {
    setLoading(true)
    setMsg(null)
    try {
      const rec = await api.checkInOut(check_type)
      setMsg({
        kind: 'ok',
        text:
          check_type === 'in'
            ? `Masuk dicatat pukul ${formatTime(rec.check_at)}`
            : `Pulang dicatat pukul ${formatTime(rec.check_at)}`,
      })
      await loadToday()
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Gagal absen' })
    } finally {
      setLoading(false)
    }
  }

  const checkedIn = !!row?.check_in
  const checkedOut = !!row?.check_out

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Absen Hari Ini</h1>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-slate-500">Masuk</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {checkedIn ? formatTime(row.check_in!) : '—'}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-slate-500">Pulang</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {checkedOut ? formatTime(row.check_out!) : '—'}
          </div>
        </div>
      </div>

      {msg && (
        <div className={`rounded-lg p-3 text-sm ${msg.kind === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => doCheck('in')}
          disabled={checkedIn || loading}
          className="rounded-xl bg-emerald-600 py-4 text-lg font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          Masuk
        </button>
        <button
          onClick={() => doCheck('out')}
          disabled={checkedOut || !checkedIn || loading}
          className="rounded-xl bg-rose-600 py-4 text-lg font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
        >
          Pulang
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Tanggal: {row ? row.date : today}
      </p>
    </div>
  )
}
