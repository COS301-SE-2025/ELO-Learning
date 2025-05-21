const { Test } = require('@nestjs/testing');
const { INestApplication } = require('@nestjs/common');
const request = require('supertest'); // ✅ Fixed
const { AppModule } = require('./../src/app.module');

describe('AppController (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
