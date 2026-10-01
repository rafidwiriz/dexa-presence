import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.dto';
import { Employee, EmployeeRole } from './employee.entity';
import { EmployeesService } from './employees.service';

const SELF_EDITABLE_FIELDS = ['phone', 'photo_url'] as const;

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees') // url_prefix='/employees'
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Roles(EmployeeRole.ADMIN)
  @Get()
  findAll(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<Employee> {
    const employee = await this.employeesService.findOne(id);
    if (user.role !== EmployeeRole.ADMIN && user.sub !== employee.id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return employee;
  }

  @Roles(EmployeeRole.ADMIN)
  @Post()
  create(@Body() dto: CreateEmployeeDto): Promise<Employee> {
    const { password, ...rest } = dto;
    return this.employeesService.create({ ...rest, password_hash: password });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Employee> {
    const employee = await this.employeesService.findOne(id);

    if (user.role !== EmployeeRole.ADMIN) {
      if (user.sub !== employee.id) {
        throw new ForbiddenException('You can only edit your own profile');
      }
      const forbidden = Object.keys(dto).filter(
        (key) => !SELF_EDITABLE_FIELDS.includes(key as (typeof SELF_EDITABLE_FIELDS)[number]),
      );
      if (forbidden.length > 0) {
        throw new ForbiddenException(
          `Field(s) ${forbidden.join(', ')} are admin-only; you may edit: ${SELF_EDITABLE_FIELDS.join(', ')}`,
        );
      }
    }

    return this.employeesService.update(id, dto);
  }

  @Roles(EmployeeRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(id);
  }
}