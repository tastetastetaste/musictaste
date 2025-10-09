import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import { nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';
import { AccountStatus, LoginDto, SignupDto } from 'shared';
import { User } from '../../db/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private redisService: RedisService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
      select: [
        'password',
        'id',
        'username',
        'name',
        'contributorStatus',
        'supporter',
        'accountStatus',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Could not find user with that email');
    }

    if (user.accountStatus === AccountStatus.BANNED) {
      throw new UnauthorizedException('Account is banned');
    }

    if (user.accountStatus === AccountStatus.DELETED) {
      throw new UnauthorizedException('Account is deleted');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new UnauthorizedException('Incorrect password');
    }

    return user;
  }

  private async createConfirmEmailLink(userId: string) {
    const key = nanoid(36);
    this.redisService.setConfirmEmailUserId(key, userId);

    return `${this.configService.get('FRONTEND_URL')}/account/confirm/${key}`;
  }

  async signup(dto: SignupDto) {
    const username = dto.username.toLowerCase();
    const email = dto.email.toLowerCase();
    const name = dto.username;
    const password = dto.password;

    const emailExists = await this.usersRepository.findOne({
      where: { email },
      select: ['id'],
    });
    if (emailExists) {
      throw new BadRequestException('Email is already registered!');
    }

    const usernameExists = await this.usersRepository.findOne({
      where: { username },
      select: ['id'],
    });

    if (usernameExists) {
      throw new BadRequestException('Username is taken!');
    }

    const newUser = new User();
    newUser.username = username;
    newUser.name = name;
    newUser.email = email;
    newUser.password = await bcrypt.hash(password, 10);

    const user = await this.usersRepository.save(newUser);

    const link = await this.createConfirmEmailLink(user.id);

    this.mailService.sendConfirmationEmail(email, username, link);

    return user;
  }

  async confirmEmail(token: string) {
    const userId = await this.redisService.getConfirmEmailUserId(token);

    if (!userId) throw new BadRequestException('Invalid');

    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ accountStatus: AccountStatus.CONFIRMED })
      .where('id = :id', { id: userId })
      .execute();

    await this.redisService.delConfirmEmailUserId(token);

    return userId;
  }
  private async createForgotPasswordLink(userId: string) {
    const key = nanoid(36);
    this.redisService.setForgotPasswordUserId(key, userId);
    return `${this.configService.get(
      'FRONTEND_URL',
    )}/account/password/new/${key}`;
  }

  async sendForgotPasswordEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Could not find user with that email');
    }

    const link = await this.createForgotPasswordLink(user.id);

    this.mailService.sendForgotPasswordEmail(email, user.name, link);

    return true;
  }
  async forgotPasswordChange(newPassword: string, key: string) {
    const userId = await this.redisService.getForgotPasswordUserId(key);

    if (!userId) {
      throw new BadRequestException('Key has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({
        password: hashedPassword,
      })
      .returning('*')
      .where('id = :id', { id: userId })
      .execute();

    await this.redisService.delForgotPasswordUserId(key);

    const user = await this.usersRepository.findOne({ where: { id: userId } });

    return user;
  }
  async updatePassword(
    id: string,
    input: { oldPassword: string; newPassword: string },
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'password'],
    });

    if (!user) throw new BadRequestException();

    const valid = await bcrypt.compare(input.oldPassword, user.password);

    if (!valid) {
      throw new UnauthorizedException();
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);

    user.password = hashedPassword;
    await this.usersRepository.save(user);

    return true;
  }
}
