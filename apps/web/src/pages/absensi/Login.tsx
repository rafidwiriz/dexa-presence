import { useState, type FormEvent } from 'react'
import { useAuth } from '../../lib/auth'

export default function AbsensiLogin() {
  const { login } = useAuth()
  const [company_email, setCompanyEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(company_email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Absensi WFH</h1>
        <p className="text-sm text-slate-500 mb-6">Masuk dengan email perusahaan</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm p-3">{error}</div>
        )}

        <label className="block mb-4">
          <span className="text-sm font-medium text-slate-600">Email Perusahaan</span>
          <input
            type="email"
            required
            value={company_email}
            onChange={(e) => setCompanyEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm font-medium text-slate-600">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky-600 py-2 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
        >
          {loading ? 'Memuat...' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
