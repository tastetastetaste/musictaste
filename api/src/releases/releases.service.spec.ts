import { Test, TestingModule } from '@nestjs/testing';
import { ReleasesService } from './releases.service';

describe('ReleasesService', () => {
  let service: ReleasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReleasesService],
    }).compile();

    service = module.get<ReleasesService>(ReleasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
