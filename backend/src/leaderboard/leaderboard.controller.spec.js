const { Test, TestingModule } = require('@nestjs/testing');
const { LeaderboardController } = require('./leaderboard.controller');

describe('LeaderboardController', () => {
  let controller;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [LeaderboardController],
    }).compile();

    controller = module.get(LeaderboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
