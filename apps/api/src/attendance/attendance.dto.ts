import { IsEnum } from 'class-validator';
import { CheckType } from './attendance.entity';

export class CheckInOutDto {
  @IsEnum(CheckType)
  check_type: CheckType;
}
