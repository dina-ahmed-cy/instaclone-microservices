"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const notification_module_1 = require("./notification.module");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const app = await core_1.NestFactory.create(notification_module_1.NotificationServiceModule);
    const configService = app.get(config_1.ConfigService);
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [configService.get('RABBITMQ_URI')],
            queue: 'notifications_queue',
            queueOptions: {
                durable: true,
            },
        },
    });
    await app.startAllMicroservices();
}
bootstrap();
//# sourceMappingURL=main.js.map