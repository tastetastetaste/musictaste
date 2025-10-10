import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CommentEntityType,
  CreateCommentDto,
  EntityType,
  FindCommentsDto,
  ICommentsResponse,
  NotificationType,
} from 'shared';
import { Repository } from 'typeorm';
import { Comment } from '../../db/entities/comment.entity';
import { EntitiesService } from '../entities/entities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { CommentsGateway } from './comments.gateway';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private usersService: UsersService,
    private commentsGateway: CommentsGateway,
    private notificationsService: NotificationsService,
    private entitiesService: EntitiesService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const { mentionedUsers, updatedText } =
      await this.notificationsService.extractMentionedUsers(
        createCommentDto.body.trim(),
      );

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      body: updatedText,
      user: { id: userId },
    });

    const savedComment = await this.commentsRepository.save(comment);

    const user = await this.usersService.getUserById(userId);

    await this.commentsGateway.broadcastNewComment({
      ...savedComment,
      user,
    });

    const path = await this.entitiesService.getEntityPath(
      savedComment.entityType as unknown as EntityType,
      savedComment.entityId,
    );

    const entityOwnerId = await this.entitiesService.getEntityOwnerId(
      savedComment.entityType as unknown as EntityType,
      savedComment.entityId,
    );

    const entityName = this.entitiesService.getEntityName(
      savedComment.entityType as unknown as EntityType,
    );

    if (entityOwnerId && entityOwnerId !== userId) {
      await this.notificationsService.createNotification({
        userId,
        notifyId: entityOwnerId,
        message: `commented on your ${entityName.toLowerCase()}`,
        link: path,
        notificationType: NotificationType.COMMENT,
      });
    }

    // max 50 mentions
    if (mentionedUsers.length < 50) {
      for (const mentionedUser of mentionedUsers) {
        const notifyId =
          await this.entitiesService.getUserIdByUsername(mentionedUser);

        if (!notifyId) continue;

        if (notifyId === userId) continue;

        if (notifyId === entityOwnerId) continue;

        await this.notificationsService.createNotification({
          userId,
          notifyId,
          message: `mentioned you in a ${entityName.toLowerCase()} comment`,
          link: path,
          notificationType: NotificationType.MENTION,
        });
      }
    }

    return savedComment;
  }

  async find({
    entityType,
    entityId,
    page,
  }: FindCommentsDto): Promise<ICommentsResponse> {
    const pageSize = 12;

    const [comments, totalItems] = await this.commentsRepository.findAndCount({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
      skip: ((page || 1) - 1) * pageSize,
      take: pageSize,
    });

    const uniqueUserIds = [...new Set(comments.map((c) => c.userId))];

    const users = await this.usersService.getUsersByIds(uniqueUserIds);

    const usersMap = new Map(users.map((u) => [u.id, u]));

    return {
      comments: comments.map((c) => ({
        ...c,
        user: usersMap.get(c.userId),
      })),
      currentPage: page,
      totalPages: Math.ceil(totalItems / pageSize),
      currentItems: (page - 1) * pageSize + comments.length,
      itemsPerPage: pageSize,
      totalItems,
    };
  }

  async findOne(id: string): Promise<Comment> {
    return await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findCommentsCount(
    entityType: CommentEntityType,
    entityIds: string | string[],
  ): Promise<number | { entityId: string; count: number }[]> {
    if (Array.isArray(entityIds)) {
      const results = await this.commentsRepository
        .createQueryBuilder('comment')
        .select('comment.entityId', 'entityId')
        .addSelect('COUNT(*)', 'count')
        .where('comment.entityType = :entityType', { entityType })
        .andWhere('comment.entityId IN (:...entityIds)', {
          entityIds: entityIds,
        })
        .groupBy('comment.entityId')
        .getRawMany();

      const countMap = new Map(
        results.map((r) => [r.entityId, parseInt(r.count)]),
      );

      return entityIds.map((id) => ({
        entityId: id,
        count: countMap.get(id) || 0,
      }));
    } else {
      return this.commentsRepository.count({
        where: { entityType, entityId: entityIds },
      });
    }
  }

  async deleteCommentsByEntity(
    entityType: CommentEntityType,
    entityId: string,
  ): Promise<void> {
    await this.commentsRepository.delete({
      entityType,
      entityId,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new BadRequestException();
    }

    if (comment.userId !== userId) {
      throw new UnauthorizedException();
    }

    await this.commentsRepository.delete({ id });
  }
}
