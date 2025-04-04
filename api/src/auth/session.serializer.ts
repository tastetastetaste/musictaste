import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { ContributorStatus } from 'shared';
import { User } from '../../db/entities/user.entity';

export class CurrentUserPayload {
  id: string;
  username: string;
  confirmed: boolean;
  contributorStatus: ContributorStatus;
}

@Injectable()
export class SessionSerializer extends PassportSerializer {
  // constructor(private readonly authService: AuthService) {
  //   super();
  // }
  serializeUser(
    user: User,
    done: (err: Error, user: CurrentUserPayload) => void,
  ) {
    done(null, {
      id: user.id,
      username: user.username,
      confirmed: user.confirmed,
      contributorStatus: user.contributorStatus,
    });
  }

  async deserializeUser(
    payload: CurrentUserPayload,
    done: (err: Error, user: CurrentUserPayload) => void,
  ) {
    done(null, payload);
  }
}
