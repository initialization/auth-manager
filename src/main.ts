import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  // 设置 api 访问前缀
  const prefix = config.get<string>('app.prefix');

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Nest-Admin')
    .setDescription('Nest-Admin 接口文档')
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'token',
    ).build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);

  // 项目依赖当前文档功能，最好不要改变当前地址
  // 生产环境使用 nginx 可以将当前文档地址 屏蔽外部访问
  SwaggerModule.setup(`${prefix}/swagger-ui`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Nest-Admin API Docs',
  });

  //服务端口
  const port = config.get<number>('app.port') || 8080;
  await app.listen(port);

  console.log(
    `Nest-Admin 服务启动成功 `,
    '\n',
    '\n',
    join(__dirname, '..', '../upload'),
    '服务地址',
    `http://localhost:${port}${prefix}/`,
    '\n',
    'swagger 文档地址        ',
    `http://localhost:${port}${prefix}/swagger-ui/`,
  );
}
bootstrap();
