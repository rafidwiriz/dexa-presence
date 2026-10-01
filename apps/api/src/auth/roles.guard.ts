import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthUser } from './jwt-auth.guard';
import { ROLES_KEY } from './roles.decorator';
import { EmployeeRole } from '../employees/employee.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<EmployeeRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as AuthUser | undefined;
    if (!user || !required.includes(user.role as EmployeeRole)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
