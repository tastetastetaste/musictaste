import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 60 * 12) // 12 hours
  getAll() {
    return this.languagesService.getAll();
  }
}
