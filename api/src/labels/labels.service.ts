import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLabelDto, ILabelResponse } from 'shared';
import { Repository } from 'typeorm';
import { Label } from '../../db/entities/label.entity';
import { EntitiesService } from '../entities/entities.service';
import { ReleaseLabel } from '../../db/entities/release-label.entity';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private labelRepository: Repository<Label>,
    @InjectRepository(ReleaseLabel)
    private releaseLabelRepository: Repository<ReleaseLabel>,
    private entitiesService: EntitiesService,
  ) {}

  async findOne(id: string): Promise<ILabelResponse> {
    const label = await this.labelRepository.findOne({ where: { id } });

    if (!label) throw new NotFoundException();

    return {
      label,
    };
  }

  async createLabel({ name, nameLatin }: CreateLabelDto): Promise<Label> {
    const label = new Label();
    label.name = name;
    label.nameLatin = nameLatin;

    return this.labelRepository.save(label);
  }

  async updateLabel({
    labelId,
    changes: { name, nameLatin },
  }: {
    labelId: string;
    changes: { name: string; nameLatin?: string };
  }): Promise<Label> {
    const label = await this.labelRepository.findOne({
      where: { id: labelId },
    });

    if (!label) throw new NotFoundException();

    label.name = name;
    label.nameLatin = nameLatin;
    return this.labelRepository.save(label);
  }

  async deleteLabel(id: string) {
    return await this.labelRepository.delete(id);
  }

  async mergeLabels(mergeFromId: string, mergeIntoId: string) {
    const mergeFrom = await this.labelRepository.findOne({
      where: { id: mergeFromId },
    });
    const mergeInto = await this.labelRepository.findOne({
      where: { id: mergeIntoId },
    });

    if (!mergeFrom || !mergeInto) {
      throw new Error('One or both labels not found');
    }

    await this.entitiesService.mergeLabelActivities(mergeFromId, mergeIntoId);

    await this.entitiesService.disapproveSubmissionsForEntity(
      'label',
      mergeFromId,
    );

    await this.labelRepository.delete(mergeFromId);

    return {
      mergedFrom: mergeFrom.name,
      mergedInto: mergeInto.name,
    };
  }
}
