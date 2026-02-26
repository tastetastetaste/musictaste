import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 60 * 12) // 12 hours
  findAll() {
    return this.countriesService.findAll();
  }
}
