import { Injectable } from '@nestjs/common';
import { Country } from '../../db/entities/country.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICountriesResponse } from 'shared';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
  ) {}

  async findAll(): Promise<ICountriesResponse> {
    const result = await this.countriesRepository.find({
      order: { name: 'ASC' },
    });
    return {
      countries: result,
    };
  }
}
