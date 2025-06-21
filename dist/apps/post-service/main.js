"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const post_service_module_1 = require("./post-service.module");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(post_service_module_1.PostServiceModule, {
        transport: microservices_1.Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: parseInt(process.env.POST_SERVICE_TCP_PORT, 10) || 3003,
        },
    });
    await app.listen();
}
bootstrap();
//# sourceMappingURL=main.js.map