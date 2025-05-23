import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLabelDto, ILabelResponse } from 'shared';
import { Repository } from 'typeorm';
import { Label } from '../../db/entities/label.entity';
import { ReleaseLabel } from '../../db/entities/release-label.entity';
import { ReleasesService } from '../releases/releases.service';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private labelRepository: Repository<Label>,
    @InjectRepository(ReleaseLabel)
    private releaseLabelRepository: Repository<ReleaseLabel>,
    private releasesService: ReleasesService,
  ) {}

  async findOneWithReleases(id: string): Promise<ILabelResponse> {
    const label = await this.labelRepository.findOne({ where: { id } });

    if (!label) throw new NotFoundException();

    const releases = await this.releasesService.getReleasesByLabel(label.id);

    return {
      label,
      releases,
    };
  }

  async createLabel({ name }: CreateLabelDto): Promise<Label> {
    const label = new Label();
    label.name = name;

    return this.labelRepository.save(label);
  }

  async deleteLabel(id: string) {
    return await this.labelRepository.delete(id);
  }
}
