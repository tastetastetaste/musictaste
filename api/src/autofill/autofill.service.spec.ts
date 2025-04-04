import { Test, TestingModule } from '@nestjs/testing';
import { AutofillService } from './autofill.service';

describe('AutofillService', () => {
  let service: AutofillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutofillService],
    }).compile();

    service = module.get<AutofillService>(AutofillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
