import { Injectable } from '@nestjs/common';
import { ListsService } from '../lists/lists.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ListItem } from '../../db/entities/list-item.entity';
import { Repository } from 'typeorm';
import { ReleasesService } from '../releases/releases.service';

@Injectable()
export class HomeService {
  constructor(
    private readonly releasesService: ReleasesService,
    @InjectRepository(ListItem)
    private listItemsRepository: Repository<ListItem>,
  ) {}
  async getCommunityHighlight() {
    const listId = '0QqHwYeHnvFo7';

    const listItem = await this.listItemsRepository.findOne({
      select: { releaseId: true },
      where: { listId },
      order: { index: 'ASC' },
    });

    const releases = await this.releasesService.getReleasesByIds([
      listItem.releaseId,
    ]);

    return releases[0];
  }
}
