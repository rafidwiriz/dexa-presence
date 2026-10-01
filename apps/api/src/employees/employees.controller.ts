import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.dto';
import { Employee } from './employee.entity';
import { EmployeesService } from './employees.service';

@Controller('employees') // url_prefix='/employees'
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get() findAll(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }

  @Get(':id') findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.findOne(id);
  }

  @Post() create(@Body() dto: CreateEmployeeDto): Promise<Employee> {
    const { password, ...rest } = dto;
    return this.employeesService.create({ ...rest, password_hash: password });
  }

  @Patch(':id') update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.employeesService.update(id, dto);
  }

  @Delete(':id') remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(id);
  }
}
