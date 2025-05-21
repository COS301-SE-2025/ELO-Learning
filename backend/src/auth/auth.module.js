const { Module } = require('@nestjs/common');
const { AuthController } = require('./auth.controller');
const { AuthService } = require('./auth.service');

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
class AuthModule {}
