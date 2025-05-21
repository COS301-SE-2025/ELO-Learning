const { Test, TestingModule } = require('@nestjs/testing');
const { UsersController } = require('./users.controller');

describe('UsersController', () => {
  let controller;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
    }).compile();

    controller = module.get(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
