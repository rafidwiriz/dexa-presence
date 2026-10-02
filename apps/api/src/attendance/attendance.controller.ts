import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AttendanceService } from './attendance.service';
import { CheckInOutDto } from './attendance.dto';

@UseGuards(JwtAuthGuard) // every route needs a login
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check')
  check(@Body() dto: CheckInOutDto, @CurrentUser() user: AuthUser) {
    return this.attendanceService.checkInOut(user.sub, dto.check_type);
  }

  @Get('summary')
  summary(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Query('tz') tz: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.attendanceService.summary(
      user.sub,
      from,
      to,
      tz ?? 'Asia/Jakarta',
    );
  }
}
