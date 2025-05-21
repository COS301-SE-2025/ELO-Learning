const { Module } = require('@nestjs/common');
const { AppController } = require('./app.controller');
const { AppService } = require('./app.service');
const { UsersModule } = require('./users/users.module');
const { AnswersModule } = require('./answers/answers.module');
const { QuestionsModule } = require('./questions/questions.module');
const { AuthModule } = require('./auth/auth.module');
const { LeaderboardModule } = require('./leaderboard/leaderboard.module');

@Module({
  imports: [
    UsersModule,
    AnswersModule,
    QuestionsModule,
    AuthModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
class AppModule {}
