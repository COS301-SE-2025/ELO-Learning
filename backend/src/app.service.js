const { Injectable } = require('@nestjs/common');

@Injectable()
class AppService {
  getHello() {
    return 'Hello World!';
  }
}
