import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateListDto,
  FindListsDto,
  IListCommentsResponse,
  IListItemsResponse,
  IListResponse,
  IListsResponse,
  UpdateListDto,
} from 'shared';
import { Repository } from 'typeorm';
import { ReleasesService } from '../releases/releases.service';
import { UsersService } from '../users/users.service';
import { ListComment } from '../../db/entities/list-comment.entity';
import { ListItem } from '../../db/entities/list-item.entity';
import { ListLike } from '../../db/entities/list-like.entity';
import { List } from '../../db/entities/list.entity';
import { ImagesService } from '../images/images.service';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List) private listsRepository: Repository<List>,
    @InjectRepository(ListItem)
    private listItemsRepository: Repository<ListItem>,

    @InjectRepository(ListLike)
    private listLikesRepository: Repository<ListLike>,
    @InjectRepository(ListComment)
    private listCommentsRepository: Repository<ListComment>,
    private releasesService: ReleasesService,
    private usersService: UsersService,
    private imagesService: ImagesService,
  ) {}

  private async getManyByIds(ids: string[]) {
    if (ids.length === 0) return [];

    const lists = await this.listsRepository
      .createQueryBuilder('l')
      .select('l.id', 'id')
      .addSelect('l.userId', 'userId')
      .addSelect('l.title', 'title')
      .addSelect('l.description', 'description')
      .addSelect('l.ranked', 'ranked')
      .addSelect('l.grid', 'grid')
      .addSelect('l.published', 'published')
      .addSelect('l.publishedDate', 'publishedDate')
      .addSelect('l.createdAt', 'createdAt')
      .addSelect('l.updatedAt', 'updatedAt')
      .addSelect('COUNT(DISTINCT like.id)', 'likesCount')
      .addSelect('COUNT(DISTINCT comment.id)', 'commentsCount')
      .addSelect('COUNT(DISTINCT item.id)', 'listItemsCount')
      .leftJoin('l.likes', 'like')
      .leftJoin('l.comments', 'comment')
      .leftJoin('l.items', 'item')
      .groupBy('l.id')
      .whereInIds(ids)
      .getRawMany();

    const [users, covers] = await Promise.all([
      this.usersService.getUsersByIds(lists.map((list) => list.userId)),
      Promise.all(ids.map((id) => this.getCover(id))),
    ]);

    const listMap = new Map(lists.map((list) => [list.id, list]));
    const userMap = new Map(users.map((user) => [user.id, user]));

    return ids.map((id, index) => ({
      ...listMap.get(id),
      user: userMap.get(listMap.get(id)?.userId),
      cover: covers[index],
    }));
  }

  private async getOneById(id: string) {
    const list = await this.listsRepository
      .createQueryBuilder('l')
      .select('l.id', 'id')
      .addSelect('l.userId', 'userId')
      .addSelect('l.title', 'title')
      .addSelect('l.description', 'description')
      .addSelect('l.ranked', 'ranked')
      .addSelect('l.grid', 'grid')
      .addSelect('l.published', 'published')
      .addSelect('l.publishedDate', 'publishedDate')
      .addSelect('l.createdAt', 'createdAt')
      .addSelect('l.updatedAt', 'updatedAt')
      .addSelect('COUNT(DISTINCT like.id)', 'likesCount')
      .addSelect('COUNT(DISTINCT comment.id)', 'commentsCount')
      .addSelect('COUNT(DISTINCT item.id)', 'listItemsCount')
      .leftJoin('l.likes', 'like')
      .leftJoin('l.comments', 'comment')
      .leftJoin('l.items', 'item')
      .groupBy('l.id')
      .where('l.id = :id', { id })
      .getRawOne();

    const user = await this.usersService.getUserById(list.userId);

    return {
      ...list,
      user,
    };
  }

  private async getCover(id: string) {
    const result = await this.listItemsRepository.query(
      `
      SELECT 
        "li"."listId", 
        "r"."imagePath" AS "imagePath",
        "r"."explicitCoverArt" AS "explicitCoverArt"
      FROM "list_item" "li" 
      LEFT JOIN ( 
        SELECT "r"."id" ,"r"."imagePath", "r"."explicitCoverArt" from "release" "r"
      ) "r" ON "li"."releaseId" = "r"."id"
      WHERE "li"."listId" = $1
      ORDER BY "li"."index" LIMIT 5
      `,
      [id],
    );

    return result.map((itm) => ({
      cover: this.imagesService.getReleaseCover(itm.imagePath)?.sm,
      explicitCoverArt: itm.explicitCoverArt
        ? itm.explicitCoverArt.split(',')
        : null,
    }));
  }

  async find(
    { sortBy, page, releaseId, userId }: FindListsDto,
    currentUserId?: string,
    pageSize = 12,
  ): Promise<IListsResponse> {
    const listsQB = this.listsRepository
      .createQueryBuilder('list')
      .select('list.id', 'id');

    // RELEASE LISTS
    if (releaseId) {
      listsQB
        .where('li.releaseId = :releaseId', {
          releaseId,
        })
        .andWhere('list.published')
        .leftJoin('list.items', 'li');
    }
    // USER LISTS
    else if (userId) {
      listsQB.where('list.userId = :userId', {
        userId,
      });
      if (userId !== currentUserId) {
        listsQB.andWhere('list.published');
      }
    }
    // OTHER
    else {
      listsQB
        .where('list.published')
        .andWhere("list.publishedDate >= date_trunc('year', current_date)");
    }

    // SORT BY
    switch (sortBy) {
      case 'popular':
        listsQB
          .leftJoin('list.likes', 'likes')
          .orderBy('COUNT(likes)', 'DESC')
          .groupBy('list.id');
        break;

      case 'updatedDate':
        listsQB.orderBy('list.updatedAt', 'DESC');
        break;

      case 'date':
      default:
        listsQB.orderBy('list.publishedDate', 'DESC');
        break;
    }

    const totalItems = await listsQB.clone().getCount();

    const listIds = await listsQB
      .select('list.id', 'id')
      .take(pageSize)
      .skip(((page || 1) - 1) * pageSize)
      .getRawMany();

    const lists = await this.getManyByIds(listIds.map((l) => l.id));

    return {
      lists,
      currentPage: page,
      totalPages: Math.ceil(totalItems / pageSize),
      currentItems: (page - 1) * pageSize + lists.length,
      itemsPerPage: pageSize,
      totalItems,
    };
  }

  async findOne(id: string, currentUserId: string): Promise<IListResponse> {
    const list = await this.getOneById(id);

    if (!list || (list.published === false && list.userId !== currentUserId)) {
      return null;
    }

    let likedByMe = false;

    if (currentUserId) {
      const like = await this.listLikesRepository.findOne({
        where: {
          listId: id,
          userId: currentUserId,
        },
      });

      likedByMe = !!like;
    }

    return {
      list: {
        ...list,
        likedByMe,
      },
    };
  }

  async findItems(
    id: string,
    currentUserId: string,
    page: number,
  ): Promise<IListItemsResponse> {
    const pageSize = 48;

    const items = await this.listItemsRepository.find({
      where: {
        listId: id,
      },
      order: {
        index: 'ASC',
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    const releases = await this.releasesService.getReleasesByIds(
      items.map((i) => i.releaseId),
    );

    const totalItems = await this.listItemsRepository.count({
      where: {
        listId: id,
      },
    });

    return {
      items: items.map((i) => ({
        ...i,
        release: releases.find((r) => r.id === i.releaseId),
      })),
      currentPage: page,
      itemsPerPage: pageSize,
      totalItems: totalItems,
      currentItems: (page - 1) * pageSize + items.length,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async releaseInMyLists(releaseId: string, currentUserId: string) {
    const res = await this.listsRepository
      .createQueryBuilder('l')
      .select('l.id', 'listId')
      .addSelect('li.id', 'itemId')
      .where('l.userId = :userId')
      .innerJoin('l.items', 'li', 'li.releaseId = :releaseId')
      .setParameters({ userId: currentUserId, releaseId })
      .getRawMany();

    return res;
  }

  async create(createListDto: CreateListDto, currentUserId: string) {
    const { title, description, grid, ranked } = createListDto;

    const newList = new List();

    newList.title = title;

    newList.userId = currentUserId;

    newList.description = description;

    newList.grid = grid;

    newList.ranked = ranked;

    await this.listsRepository.save(newList);

    const list = await this.getOneById(newList.id);

    return list;
  }

  async update(
    id: string,
    { title, description, grid, ranked }: UpdateListDto,
    currentUserId: string,
  ) {
    const _list = await this.listsRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'userId'],
    });

    if (_list.userId !== currentUserId) {
      throw new UnauthorizedException();
    }
    await this.listsRepository
      .createQueryBuilder()
      .update(List)

      .set({ title, description, grid, ranked })
      .where('id = :id', { id })
      .execute();

    const list = await this.getOneById(id);

    return list;
  }

  async publish(id: string, currentUserId: string) {
    const _list = await this.listsRepository.findOne({
      where: {
        id,
      },
      relations: {
        items: true,
      },
    });

    if (_list.userId !== currentUserId) {
      throw new UnauthorizedException();
    }

    await this.listsRepository
      .createQueryBuilder()
      .update(List)
      .set({ published: true, publishedDate: () => 'NOW()' })
      .where('id = :id', { id })
      .execute();

    const list = await this.getOneById(id);

    return list;
  }
  async remove(id: string, currentUserId: string) {
    const list = await this.listsRepository.findOne({
      where: { id },
      relations: { items: true },
    });

    if (!list) throw new BadRequestException();

    if (list.userId !== currentUserId) throw new UnauthorizedException();

    const deleted = await this.listsRepository.delete({
      id,
    });

    if (deleted) {
      return true;
    }

    return false;
  }
  async addToList(listId: string, releaseId: string, currentUserId: string) {
    const _list = await this.listsRepository.findOne({
      where: {
        id: listId,
      },
      select: ['id', 'userId'],
    });

    if (_list.userId !== currentUserId) {
      throw new UnauthorizedException();
    }

    const i = await this.listItemsRepository.count({ where: { listId } });

    const newLi = new ListItem();

    newLi.releaseId = releaseId;
    newLi.listId = listId;
    newLi.index = i;
    await this.listItemsRepository.save(newLi);

    // update updatedAt
    await this.listsRepository.update({ id: listId }, {});

    return true;
  }
  async removeFromList(listId: string, itemId: string, currentUserId: string) {
    const _list = await this.listsRepository.findOne({
      where: {
        id: listId,
      },
      select: ['id', 'userId'],
    });

    if (_list.userId !== currentUserId) {
      throw new UnauthorizedException();
    }

    const item = await this.listItemsRepository.findOne({
      where: { listId, id: itemId },
      select: ['id', 'index', 'releaseId'],
    });

    if (!item) return null;

    await this.listItemsRepository
      .createQueryBuilder()
      .update(ListItem)
      .set({
        index: () => 'index - 1',
      })
      .where('listId = :listId', { listId })
      .andWhere('index > :thisIndex', { thisIndex: item.index })
      .execute();

    await this.listItemsRepository.delete({ id: item.id });

    // update updatedAt
    await this.listsRepository.update({ id: listId }, {});

    return true;
  }
  async reorderListItems({
    items,
    listId,
    userId,
  }: {
    listId: string;
    items: { id: string; index: number }[];
    userId: string;
  }) {
    const _list = await this.listsRepository.findOne({
      where: {
        id: listId,
      },
      select: ['id', 'userId'],
    });

    if (_list.userId !== userId) {
      throw new UnauthorizedException();
    }

    const cases = items
      .map((itm) => `WHEN id = '${itm.id}' THEN ${itm.index}`)
      .join(' ');

    const ids = items.map((itm) => `'${itm.id}'`).join(', ');

    const query = `
    UPDATE "list_item"
    SET "index" = CASE ${cases} END
    WHERE "listId" = '${listId}' AND "id" IN (${ids});
  `;

    await this.listItemsRepository.query(query);

    // update updatedAt date
    await this.listsRepository.update({ id: listId }, {});

    return true;
  }
  async editListItem(listItemId: string, note: string, currentUserId: string) {
    const _list = await this.listsRepository
      .createQueryBuilder('list')
      .select(['list.id', 'list.userId'])
      .innerJoin('list.items', 'item', 'item.id = :id', { id: listItemId })
      .getOne();

    if (_list.userId !== currentUserId) {
      throw new UnauthorizedException();
    }
    const {
      raw: [UpdatedListItem],
    } = await this.listItemsRepository
      .createQueryBuilder()
      .update(ListItem)
      .set({ note: note || null })
      .where('id = :listItemId', { listItemId })
      .returning('*')
      .execute();

    return UpdatedListItem;
  }

  async like(listId: string, currentUserId: string) {
    const list = await this.listsRepository.findOne({ where: { id: listId } });

    if (!list) throw new BadRequestException();

    const _ll = new ListLike();
    _ll.listId = listId;
    _ll.userId = currentUserId;

    await this.listLikesRepository.save(_ll);

    return true;
  }

  async removeLike(listId: string, currentUserId: string) {
    const like = await this.listLikesRepository.findOne({
      where: {
        userId: currentUserId,
        listId,
      },
    });

    if (!like) {
      throw new BadRequestException();
    }

    await this.listLikesRepository.delete({ id: like.id });

    return true;
  }
  async comment(listId: string, body: string, currentUserId: string) {
    const list = await this.listsRepository.findOne({ where: { id: listId } });

    if (!list) throw new BadRequestException();

    const lc = new ListComment();
    lc.listId = listId;
    lc.body = body;
    lc.userId = currentUserId;

    await this.listCommentsRepository.save(lc);

    return true;
  }

  async removeComment(listCommentId: string, currentUserId: string) {
    const lc = await this.listCommentsRepository.findOne({
      where: {
        id: listCommentId,
      },
    });

    if (!lc) throw new BadRequestException();

    if (lc.userId !== currentUserId) throw new UnauthorizedException();

    await this.listCommentsRepository.delete({ id: lc.id });

    return true;
  }

  async findComments(
    listId: string,
    page: number,
  ): Promise<IListCommentsResponse> {
    const comments = await this.listCommentsRepository.find({
      where: { listId },
      take: 12,
      skip: (page - 1) * 12,
      order: { createdAt: 'DESC' },
    });

    const users = await this.usersService.getUsersByIds(
      comments.map((c) => c.userId),
    );

    return {
      currentItems: comments.length,
      currentPage: 1,
      itemsPerPage: 12,
      totalItems: comments.length,
      totalPages: 1,
      comments: comments.map((c) => ({
        ...c,
        user: users.find((u) => u.id === c.userId),
      })),
    };
  }
}
