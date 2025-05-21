const { Test, TestingModule } = require('@nestjs/testing');
const { QuestionsService } = require('./questions.service');

describe('QuestionsService', () => {
  let service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [QuestionsService],
    }).compile();

    service = module.get(QuestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
