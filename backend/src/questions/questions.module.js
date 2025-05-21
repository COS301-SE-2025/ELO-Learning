const { Module } = require('@nestjs/common');
const { QuestionsService } = require('./questions.service');
const { QuestionsController } = require('./questions.controller');

@Module({
  providers: [QuestionsService],
  controllers: [QuestionsController],
})
class QuestionsModule {}
