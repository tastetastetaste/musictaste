import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../db/entities/user.entity';
import { RedisService } from '../redis/redis.service';
import { UpdateUserContributorStatusDto } from 'shared';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisService: RedisService,
  ) {}

  async updateUserContributorStatus(
    updateUserContributorStatusDto: UpdateUserContributorStatusDto,
  ) {
    const { userId, status } = updateUserContributorStatusDto;

    await this.userRepository.update(userId, {
      contributorStatus: status,
    });

    await this.redisService.removeUserSessions(userId);

    return true;
  }
}
