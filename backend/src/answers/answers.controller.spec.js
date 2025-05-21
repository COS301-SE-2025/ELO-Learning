const { Test, TestingModule } = require('@nestjs/testing');
const { AnswersController } = require('./answers.controller');

describe('AnswersController', () => {
  let controller;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AnswersController],
    }).compile();

    controller = module.get(AnswersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
