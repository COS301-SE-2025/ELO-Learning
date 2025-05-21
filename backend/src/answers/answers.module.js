const { Module } = require('@nestjs/common');
const { AnswersController } = require('./answers.controller');
const { AnswersService } = require('./answers.service');

@Module({
  controllers: [AnswersController],
  providers: [AnswersService],
})
class AnswersModule {}
