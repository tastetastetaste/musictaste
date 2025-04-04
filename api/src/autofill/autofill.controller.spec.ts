import { Test, TestingModule } from '@nestjs/testing';
import { AutofillController } from './autofill.controller';
import { AutofillService } from './autofill.service';

describe('AutofillController', () => {
  let controller: AutofillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutofillController],
      providers: [AutofillService],
    }).compile();

    controller = module.get<AutofillController>(AutofillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
