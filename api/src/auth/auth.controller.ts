import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticatedGuard } from './Authenticated.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto, SignupDto, AccountStatus } from 'shared';
import { Throttle } from '@nestjs/throttler';
import { RedisService } from '../redis/redis.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 1000 * 60 * 60 } })
  @Post('signup')
  signupUser(@Req() req, @Body() signup: SignupDto) {
    return this.authService.signup(signup);
  }

  @Throttle({ default: { limit: 10, ttl: 1000 * 60 * 60 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  loginUser(@Req() req, @Body() login: LoginDto) {
    if (req.session.passport?.user) {
      this.redisService.saveUserSessionId(
        req.session.passport.user.id,
        req.sessionID,
      );
    }

    return req.session;
  }

  @Post('logout')
  logoutUser(@Req() req) {
    return req.logOut((err) => {
      if (err) throw new InternalServerErrorException();
    });
  }

  @Get('confirm/:token')
  async confirmEmail(@Req() req, @Param('token') token: string) {
    const userId = await this.authService.confirmEmail(token);

    if (userId) {
      this.redisService.updateUserSessionsAccountStatus(
        userId,
        AccountStatus.CONFIRMED,
      );

      return true;
    }

    return false;
  }

  @Throttle({ default: { limit: 3, ttl: 1000 * 60 * 60 } })
  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.sendForgotPasswordEmail(email);
  }

  @Post('forgot-password-change')
  forgotPasswordChange(
    @Body('password') newPassword: string,
    @Body('token') token: string,
  ) {
    return this.authService.forgotPasswordChange(newPassword, token);
  }

  @UseGuards(AuthenticatedGuard)
  @Put('update-password')
  updatePassword(
    @Body()
    { id, ...data }: { id: string; oldPassword: string; newPassword: string },
  ) {
    return this.authService.updatePassword(id, data);
  }
}
