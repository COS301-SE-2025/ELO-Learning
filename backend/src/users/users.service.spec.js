const { Test, TestingModule } = require('@nestjs/testing');
const { UsersService } = require('./users.service');

describe('UsersService', () => {
  let service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
