const { Module } = require('@nestjs/common');
const { UsersController } = require('./users.controller');
const { UsersService } = require('./users.service');

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
class UsersModule {}
