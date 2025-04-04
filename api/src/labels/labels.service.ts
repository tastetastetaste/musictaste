import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLabelDto } from 'shared';
import { Repository } from 'typeorm';
import { Label } from '../../db/entities/label.entity';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private labelRepository: Repository<Label>,
  ) {}

  async createLabel({ name }: CreateLabelDto): Promise<Label> {
    const label = new Label();
    label.name = name;

    return this.labelRepository.save(label);
  }
}
