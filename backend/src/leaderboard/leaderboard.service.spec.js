const { Test, TestingModule } = require('@nestjs/testing');
const { LeaderboardService } = require('./leaderboard.service');

describe('LeaderboardService', () => {
  let service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LeaderboardService],
    }).compile();

    service = module.get(LeaderboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
