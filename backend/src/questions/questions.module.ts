import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';

@Module({
  providers: [QuestionsService],
  controllers: [QuestionsController],
})
export class QuestionsModule {}
