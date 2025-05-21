const { Test, TestingModule } = require('@nestjs/testing');
const { AnswersService } = require('./answers.service');

describe('AnswersService', () => {
  let service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AnswersService],
    }).compile();

    service = module.get(AnswersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
