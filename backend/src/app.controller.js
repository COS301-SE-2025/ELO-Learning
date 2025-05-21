const { Controller, Get } = require('@nestjs/common');
const { AppService } = require('./app.service');

@Controller()
class AppController {
  constructor(appService) {
    this.appService = appService;
  }

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
