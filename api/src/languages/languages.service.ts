import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../../db/entities/language.entity';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private langugaeRepository: Repository<Language>,
  ) {}

  async getAll() {
    const languages = await this.langugaeRepository.find();

    return { languages };
  }
}
