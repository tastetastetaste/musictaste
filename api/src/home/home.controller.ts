import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { HomeService } from './home.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('community-highlight')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 30) // 30 minutes
  getCommunityHighlight() {
    return this.homeService.getCommunityHighlight();
  }
}
