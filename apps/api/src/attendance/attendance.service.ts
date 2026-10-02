import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, CheckType } from './attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly repo: Repository<Attendance>,
  ) {}

  checkInOut(employeeId: string, checkType: CheckType): Promise<Attendance> {
    const record = this.repo.create({
      employee_id: employeeId,
      check_type: checkType,
      check_at: new Date(), // server-stamped (D-011)
    });
    return this.repo.save(record);
  }

  async summary(
    employeeId: string,
    from: string | undefined,
    to: string | undefined,
    tz: string,
  ): Promise<
    {
      date: string;
      check_in: string | null;
      check_out: string | null;
    }[]
  > {
    const now = new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = to ? new Date(to) : now;

    const rows = await this.repo.query(
      `SELECT
         to_char(check_at AT TIME ZONE $1, 'YYYY-MM-DD') AS date,
         max(check_at) FILTER (WHERE check_type = 'in')  AS check_in,
         max(check_at) FILTER (WHERE check_type = 'out') AS check_out
       FROM attendance
       WHERE employee_id = $2
         AND check_at >= $3 AND check_at <= $4
       GROUP BY to_char(check_at AT TIME ZONE $1, 'YYYY-MM-DD')
       ORDER BY date`,
      [tz, employeeId, fromDate.toISOString(), toDate.toISOString()],
    );

    return rows.map((r: any) => ({
      date: r.date,
      check_in: r.check_in ? new Date(r.check_in).toISOString() : null,
      check_out: r.check_out ? new Date(r.check_out).toISOString() : null,
    }));
  }
}
