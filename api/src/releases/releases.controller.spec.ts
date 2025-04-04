import { Test, TestingModule } from '@nestjs/testing';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';

describe('ReleasesController', () => {
  let controller: ReleasesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReleasesController],
      providers: [ReleasesService],
    }).compile();

    controller = module.get<ReleasesController>(ReleasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
