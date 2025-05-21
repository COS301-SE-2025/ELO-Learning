const { Test, TestingModule } = require('@nestjs/testing');
const { QuestionsController } = require('./questions.controller');

describe('QuestionsController', () => {
  let controller;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [QuestionsController],
    }).compile();

    controller = module.get(QuestionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
