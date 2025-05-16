import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLabelDto, ILabelResponse, LabelStatus } from 'shared';
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

  async softDelete({ id }: { id: string }): Promise<boolean> {
    try {
      await Promise.all([
        this.labelRepository.update({ id }, { status: LabelStatus.DELETED }),
        this.releaseLabelRepository.delete({ labelId: id }),
      ]);
      return true;
    } catch (err) {
      return false;
    }
  }
}
