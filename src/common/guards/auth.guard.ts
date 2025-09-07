import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard extends JwtAuthGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const result = super.canActivate(context);
    if (result instanceof Promise) {
      return result;
    }
    // Check if result is Observable
    if (result && typeof (result as any).subscribe === 'function') {
      return lastValueFrom(result as any);
    }
    // result is boolean
    return result as boolean;
  }
}