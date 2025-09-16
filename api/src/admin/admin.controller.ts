import {
  Controller,
  Patch,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { CurrentUserPayload } from '../auth/session.serializer';
import { CurUser } from '../decorators/user.decorator';
import {
  ContributorStatus,
  UpdateUserContributorStatusDto,
  UpdateUserSupporterStatusDto,
} from 'shared';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('user/contributor-status')
  @UseGuards(AuthenticatedGuard)
  updateUserContributorStatus(
    @Body() updateUserContributorStatusDto: UpdateUserContributorStatusDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    if (user.contributorStatus !== ContributorStatus.ADMIN) {
      throw new UnauthorizedException();
    }

    return this.adminService.updateUserContributorStatus(
      updateUserContributorStatusDto,
    );
  }

  @Patch('user/supporter-status')
  @UseGuards(AuthenticatedGuard)
  updateUserSupporterStatus(
    @Body() updateUserSupporterStatusDto: UpdateUserSupporterStatusDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    if (user.contributorStatus !== ContributorStatus.ADMIN) {
      throw new UnauthorizedException();
    }

    return this.adminService.updateUserSupporterStatus(
      updateUserSupporterStatusDto,
    );
  }
}
