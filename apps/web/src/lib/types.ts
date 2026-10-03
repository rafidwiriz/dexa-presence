export type Role = 'employee' | 'admin'

export interface Employee {
  id: string
  name: string
  company_email: string
  position: string
  phone: string | null
  photo_url: string | null
  role: Role
  is_active: boolean
}

export type CheckType = 'in' | 'out'

export interface AttendanceRecord {
  id: string
  check_type: CheckType
  check_at: string
  employee_id: string
  employee?: Employee | null
}

export interface AttendanceSummaryRow {
  date: string
  check_in: string | null
  check_out: string | null
}

export interface AuthResponse {
  accessToken: string
  employee: Employee
}

export interface ProfileUpdatedEvent {
  employeeId: string
  changedBy: string
  changedByName?: string | null
  fields: Record<string, { old: unknown; new: unknown }>
  occurredAt: string
}
