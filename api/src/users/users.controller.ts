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

    const u = await this.usersService.getUserById(currentUser.id);

    return {
      user: {
        ...u,
        confirmed: currentUser.confirmed,
        contributorStatus: currentUser.contributorStatus,
      },
    };
  }

  @Get('username/:username')
  async findOne(
    @Param('username') username: string,
    @CurUser('id') currentUserId: string,
  ): Promise<IUserProfileResponse> {
    const user = await this.usersService.getUserByUsername(username);

    const [stats, following, followedBy] = await Promise.all([
      await this.usersService.getUserStats(user.id),
      await this.usersService.isFollowing(user.id, currentUserId),
      await this.usersService.isFollowedBy(user.id, currentUserId),
    ]);

    return {
      user,
      stats,
      following,
      followedBy,
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
  follow(@Param('id') id: string, @CurUser('id') currentUserId: string) {
    return this.usersService.follow(id, currentUserId);
  }
  @Delete(':id/following')
  @UseGuards(AuthenticatedGuard)
  unfollow(@Param('id') id: string, @CurUser('id') currentUserId: string) {
    return this.usersService.unFollow(id, currentUserId);
  }

  @Patch(':id/update-profile')
  @UseGuards(AuthenticatedGuard)
  updateProfile(
    @Param('id') id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @CurUser('id') currentUserId: string,
  ) {
    if (id !== currentUserId) throw new UnauthorizedException();
    return this.usersService.updateProfile(id, updateUserProfileDto);
  }

  @Patch(':id/update-image')
  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(FileInterceptor('image'))
  updateImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
    @CurUser('id') currentUserId: string,
  ) {
    if (id !== currentUserId) throw new UnauthorizedException();
    return this.usersService.updateImage(id, {
      buffer: image.buffer,
      mimetype: image.mimetype,
    });
  }
}
