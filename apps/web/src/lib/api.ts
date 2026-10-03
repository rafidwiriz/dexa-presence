import type { AuthResponse, AttendanceRecord, AttendanceSummaryRow, Employee } from './types'

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api'

let token: string | null = localStorage.getItem('token')

export function setToken(t: string | null): void {
  token = t
  if (t) localStorage.setItem('token', t)
  else localStorage.removeItem('token')
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = Array.isArray(body.message) ? body.message.join(', ') : body.message || message
    } catch { /* non-JSON error body */ }
    throw new ApiError(res.status, message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  login: (company_email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ company_email, password }) }),

  getEmployee: (id: string) => request<Employee>(`/employees/${id}`),

  updateEmployee: (id: string, data: Partial<Pick<Employee, 'phone'>>) =>
    request<Employee>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  changePassword: (current_password: string, new_password: string) =>
    request<{ ok: boolean }>('/auth/password', { method: 'PATCH', body: JSON.stringify({ current_password, new_password }) }),

  checkInOut: (check_type: 'in' | 'out') =>
    request<AttendanceRecord>('/attendance/check', { method: 'POST', body: JSON.stringify({ check_type }) }),

  getSummary: (from: string, to: string, tz = 'Asia/Jakarta') =>
    request<AttendanceSummaryRow[]>(`/attendance/summary?from=${from}&to=${to}&tz=${tz}`),

  uploadPhoto: (id: string, file: File) => {
    const form = new FormData()
    form.append('photo', file)
    return request<Employee>(`/employees/${id}/photo`, { method: 'POST', body: form })
  },
}
