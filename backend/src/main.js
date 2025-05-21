require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
