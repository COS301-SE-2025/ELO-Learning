const { Module } = require('@nestjs/common');
const { LeaderboardService } = require('./leaderboard.service');
const { LeaderboardController } = require('./leaderboard.controller');

@Module({
  providers: [LeaderboardService],
  controllers: [LeaderboardController],
})
class LeaderboardModule {}
