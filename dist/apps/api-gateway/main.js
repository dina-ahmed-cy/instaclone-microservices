"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const api_gateway_module_1 = require("./api-gateway.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const access_token_guard_1 = require("./auth/guards/access-token.guard");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
const response_transform_interceptor_1 = require("./common/interceptors/response-transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(api_gateway_module_1.ApiGatewayModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalInterceptors(new response_transform_interceptor_1.ResponseTransformInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Instaclone API Gateway')
        .setDescription('The main API gateway for the Instaclone microservices application.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const accessTokenGuard = app.get(access_token_guard_1.AccessTokenGuard);
    app.useGlobalGuards(accessTokenGuard);
    const configService = app.get(config_1.ConfigService);
    const rabbitUri = configService.get('RABBITMQ_URI') || process.env.RABBITMQ_URI || 'amqp://localhost:5672';
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [rabbitUri],
            queue: 'gateway_cache_invalidation_queue',
            queueOptions: { durable: true },
        },
    });
    await app.startAllMicroservices();
    await app.listen(process.env.port ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map