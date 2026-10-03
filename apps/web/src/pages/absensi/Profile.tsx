import { useState } from 'react'
import { useAuth } from '../../lib/auth'
import { API_BASE } from '../../lib/api'
import { api } from '../../lib/api'
import type { Employee } from '../../lib/types'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
    </div>
  )
}

export default function Profile() {
  const { user, setUser } = useAuth()
  const API_ORIGIN = API_BASE.replace(/\/api$/, '')

  const [phoneDraft, setPhoneDraft] = useState('')
  const [current_password, setCurrentPassword] = useState('')
  const [new_password, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  if (!user) return null

  const apply = (updated: Employee) => {
    setUser(updated)
    setMsg({ kind: 'ok', text: 'Perubahan disimpan' })
  }

  const savePhone = async () => {
    setSaving(true)
    setMsg(null)
    try {
      apply(await api.updateEmployee(user.id, { phone: phoneDraft.trim() }))
      setPhoneDraft('')
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Gagal menyimpan nomor' })
    } finally {
      setSaving(false)
    }
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 2 * 1024 * 1024) {
      setMsg({ kind: 'err', text: 'Ukuran foto maksimal 2MB' })
      return
    }
    setSaving(true)
    setMsg(null)
    try {
      apply(await api.uploadPhoto(user.id, f))
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Gagal mengunggah foto' })
    } finally {
      setSaving(false)
      e.target.value = ''
    }
  }

  const savePassword = async () => {
    setSaving(true)
    setMsg(null)
    try {
      await api.changePassword(current_password, new_password)
      setMsg({ kind: 'ok', text: 'Password berhasil diubah' })
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Gagal mengubah password' })
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500'

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

      {msg && (
        <div className={`rounded-lg p-3 text-sm ${msg.kind === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 className="font-bold text-slate-800">Edit Profil</h2>

        <div>
          <label className="text-sm font-medium text-slate-600">Nomor Handphone</label>
          <div className="flex gap-2 mt-1">
            <input
              type="tel"
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              placeholder={user.phone ?? 'Contoh: 0812-3456-7890'}
              className={inputCls}
            />
            <button
              onClick={savePhone}
              disabled={saving}
              className="shrink-0 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
            >
              Simpan
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">Foto Profil</label>
          <div className="mt-1">
            <label className="inline-block cursor-pointer rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
              Ganti Foto
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-600">Ubah Password</h3>
          <input
            type="password"
            value={current_password}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Password saat ini"
            className={inputCls}
          />
          <input
            type="password"
            value={new_password}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password baru"
            className={inputCls}
          />
          <button
            onClick={savePassword}
            disabled={saving || !current_password || !new_password}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
          >
            Ganti Password
          </button>
        </div>
      </div>
    </div>
  )
}
