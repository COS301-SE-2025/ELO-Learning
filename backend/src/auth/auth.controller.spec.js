const { Test, TestingModule } = require('@nestjs/testing');
const { AuthController } = require('./auth.controller');

describe('AuthController', () => {
  let controller;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
