import {
  Controller,
  Patch,
  Post,
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
  UpdateAccountStatusDto,
  SendNotificationDto,
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

  @Patch('user/account-status')
  @UseGuards(AuthenticatedGuard)
  updateAccountStatus(
    @Body() updateAccountStatusDto: UpdateAccountStatusDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    if (user.contributorStatus !== ContributorStatus.ADMIN) {
      throw new UnauthorizedException();
    }

    return this.adminService.updateAccountStatus(updateAccountStatusDto);
  }

  @Post('user/notification')
  @UseGuards(AuthenticatedGuard)
  sendNotification(
    @Body() sendNotificationDto: SendNotificationDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    if (user.contributorStatus !== ContributorStatus.ADMIN) {
      throw new UnauthorizedException();
    }

    return this.adminService.sendNotification(sendNotificationDto, user.id);
  }

  @Post('merge')
  @UseGuards(AuthenticatedGuard)
  mergeEntities(
    @Body()
    body: {
      entityType: 'artist' | 'release' | 'label';
      mergeFromId: string;
      mergeIntoId: string;
    },
    @CurUser() user: CurrentUserPayload,
  ) {
    if (user.contributorStatus !== ContributorStatus.ADMIN) {
      throw new UnauthorizedException();
    }

    return this.adminService.mergeEntities(
      body.entityType,
      body.mergeFromId,
      body.mergeIntoId,
    );
  }
}
