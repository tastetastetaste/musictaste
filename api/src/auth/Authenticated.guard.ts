import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CurrentUserPayload } from './session.serializer';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;
    if (!user || !user.confirmed) throw new UnauthorizedException();

    return true;
  }
}
