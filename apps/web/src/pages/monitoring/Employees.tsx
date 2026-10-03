import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Employee, Role } from '../../lib/types'

interface FormState {
  name: string
  company_email: string
  password: string
  position: string
  phone: string
  role: Role
}

const emptyForm: FormState = {
  name: '', company_email: '', password: '', position: '', phone: '', role: 'employee',
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [modal, setModal] = useState<'create' | Employee | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setEmployees(await api.listEmployees())
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Gagal memuat data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setModal('create')
  }

  const openEdit = (e: Employee) => {
    setForm({
      name: e.name,
      company_email: e.company_email,
      password: '',
      position: e.position,
      phone: e.phone ?? '',
      role: e.role,
    })
    setModal(e)
  }

  const submit = async () => {
    setSaving(true)
    setMsg(null)
    try {
      if (modal === 'create') {
        await api.createEmployee(form)
        setMsg({ kind: 'ok', text: 'Karyawan ditambahkan' })
      } else if (modal) {
        await api.updateEmployee(modal.id, {
          name: form.name,
          position: form.position,
          phone: form.phone,
          role: form.role,
        })
        setMsg({ kind: 'ok', text: 'Karyawan diperbarui' })
      }
      setModal(null)
      await load()
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Gagal menyimpan' })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (e: Employee) => {
    if (!window.confirm(`Hapus karyawan ${e.name}?`)) return
    try {
      await api.deleteEmployee(e.id)
      setMsg({ kind: 'ok', text: 'Karyawan dihapus' })
      await load()
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Gagal menghapus' })
    }
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Data Karyawan</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Tambah Karyawan
        </button>
      </div>

      {msg && (
        <div className={`rounded-lg p-3 text-sm ${msg.kind === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Nama</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Posisi</th>
              <th className="text-left px-4 py-3">No. HP</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-right px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{e.name}</td>
                <td className="px-4 py-3 text-slate-600">{e.company_email}</td>
                <td className="px-4 py-3 text-slate-600">{e.position}</td>
                <td className="px-4 py-3 text-slate-600">{e.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {e.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => openEdit(e)} className="text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => remove(e)} className="text-red-500 hover:underline ml-3">Hapus</button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">Belum ada karyawan</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-slate-800">
              {modal === 'create' ? 'Tambah Karyawan' : `Edit: ${modal.name}`}
            </h2>

            <label className="block">
              <span className="text-sm font-medium text-slate-600">Nama</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </label>

            {modal === 'create' && (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-slate-600">Email Perusahaan</span>
                  <input type="email" value={form.company_email} onChange={(e) => setForm({ ...form, company_email: e.target.value })} className={inputCls} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-600">Password</span>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
                </label>
              </>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-600">Posisi</span>
              <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={inputCls} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-600">Nomor Handphone</span>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-600">Role</span>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className={inputCls}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setModal(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={submit}
                disabled={saving || !form.name || (modal === 'create' && (!form.company_email || !form.password))}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
