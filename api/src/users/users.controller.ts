import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  FindUsersDto,
  ICurrentUserResponse,
  IUserFollowsResponse,
  IUserProfileResponse,
  IUsersResponse,
  UpdateUserProfileDto,
  UpdateUserPreferencesDto,
  UpdateUserThemeDto,
  UserCollectionViewDto,
  ReorderUserCollectionViewsDto,
} from 'shared';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { CurrentUserPayload } from '../auth/session.serializer';
import { CurUser } from '../decorators/user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  async getCurrentUser(
    @CurUser() currentUser: CurrentUserPayload,
  ): Promise<ICurrentUserResponse> {
    if (!currentUser)
      return {
        user: null,
      };

    const user = await this.usersService.getCurrentUserById(currentUser.id);

    return {
      user,
    };
  }

  @Get('username/:username')
  async findOne(
    @Param('username') username: string,
    @CurUser('id') currentUserId: string,
  ): Promise<IUserProfileResponse> {
    const user = await this.usersService.getUserByUsername(username);

    const [stats, following, followedBy, collectionViews] = await Promise.all([
      await this.usersService.getUserStats(user.id),
      await this.usersService.isFollowing(user.id, currentUserId),
      await this.usersService.isFollowedBy(user.id, currentUserId),
      await this.usersService.getCollectionViews({
        userId: user.id,
        supporter: user.supporter,
      }),
    ]);

    return {
      user,
      stats,
      following,
      followedBy,
      collectionViews,
    };
  }

  @Get()
  async findUsers(
    @Query() findUsersDto: FindUsersDto,
  ): Promise<IUsersResponse> {
    return await this.usersService.findUsers(findUsersDto.type);
  }

  @Get(':id/followers')
  followers(@Param('id') id: string): Promise<IUserFollowsResponse> {
    return this.usersService.userFollowers(id);
  }
  @Get(':id/following')
  following(@Param('id') id: string): Promise<IUserFollowsResponse> {
    return this.usersService.userFollowing(id);
  }
  @Post(':id/following')
  @UseGuards(AuthenticatedGuard)
  follow(
    @Param('id') id: string,
    @CurUser('id') currentUserId: string,
    @CurUser('username') currentUserUsername: string,
  ) {
    return this.usersService.follow(id, currentUserId, currentUserUsername);
  }
  @Delete(':id/following')
  @UseGuards(AuthenticatedGuard)
  unfollow(@Param('id') id: string, @CurUser('id') currentUserId: string) {
    return this.usersService.unFollow(id, currentUserId);
  }

  @Patch('me/update-profile')
  @UseGuards(AuthenticatedGuard)
  updateProfile(
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @CurUser() currentUser: CurrentUserPayload,
  ) {
    return this.usersService.updateProfile(currentUser, updateUserProfileDto);
  }

  @Patch('me/update-preferences')
  @UseGuards(AuthenticatedGuard)
  updatePreferences(
    @Body() updateUserPreferencesDto: UpdateUserPreferencesDto,
    @CurUser('id') currentUserId: string,
  ) {
    return this.usersService.updatePreferences(
      currentUserId,
      updateUserPreferencesDto,
    );
  }

  @Patch('me/update-image')
  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(FileInterceptor('image'))
  updateImage(
    @UploadedFile() image: Express.Multer.File,
    @CurUser('id') currentUserId: string,
  ) {
    return this.usersService.updateImage(currentUserId, {
      buffer: image.buffer,
      mimetype: image.mimetype,
    });
  }

  @Patch('me/update-theme')
  @UseGuards(AuthenticatedGuard)
  updateTheme(
    @Body() updateUserThemeDto: UpdateUserThemeDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    return this.usersService.updateTheme(user.id, updateUserThemeDto);
  }

  @Post('me/collection-views')
  @UseGuards(AuthenticatedGuard)
  createCollectionView(
    @CurUser('id') currentUserId: string,
    @Body() userCollectionDto: UserCollectionViewDto,
  ) {
    return this.usersService.createCollectionView(
      currentUserId,
      userCollectionDto,
    );
  }

  @Get('me/collection-views')
  @UseGuards(AuthenticatedGuard)
  getCollectionViews(@CurUser('id') currentUserId: string) {
    return this.usersService.getCollectionViews({ userId: currentUserId });
  }

  @Patch('me/collection-views/order')
  @UseGuards(AuthenticatedGuard)
  reorderCollectionViews(
    @CurUser('id') currentUserId: string,
    @Body() reorderUserCollectionDto: ReorderUserCollectionViewsDto,
  ) {
    return this.usersService.reorderCollectionViews(
      currentUserId,
      reorderUserCollectionDto,
    );
  }

  @Patch('me/collection-views/:id')
  @UseGuards(AuthenticatedGuard)
  updateCollectionView(
    @Param('id') id: string,
    @CurUser('id') currentUserId: string,
    @Body() userCollectionViewDto: UserCollectionViewDto,
  ) {
    return this.usersService.updateCollectionView(
      currentUserId,
      id,
      userCollectionViewDto,
    );
  }

  @Delete('me/collection-views/:id')
  @UseGuards(AuthenticatedGuard)
  deleteCollectionView(
    @Param('id') id: string,
    @CurUser('id') currentUserId: string,
  ) {
    return this.usersService.deleteCollectionView(currentUserId, id);
  }
}
