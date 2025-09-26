import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../../db/entities/comment.entity';
import { UsersModule } from '../users/users.module';
import { CommentsGateway } from './comments.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), UsersModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsGateway],
  exports: [CommentsService],
})
export class CommentsModule {}
