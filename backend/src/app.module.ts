import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AnswersModule } from './answers/answers.module';
import { QuestionsModule } from './questions/questions.module';
import { AuthModule } from './auth/auth.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

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
export class AppModule {}
