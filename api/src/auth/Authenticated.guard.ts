import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CurrentUserPayload } from './session.serializer';
import { AccountStatus } from 'shared';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;
    if (
      !user ||
      !(
        user.accountStatus === AccountStatus.CONFIRMED ||
        user.accountStatus === AccountStatus.WARNED
      )
    )
      throw new UnauthorizedException();

    return true;
  }
}
