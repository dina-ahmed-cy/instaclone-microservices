"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostServiceModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const microservices_1 = require("@nestjs/microservices");
const post_schema_1 = require("./schemas/post.schema");
const post_service_service_1 = require("./post-service.service");
const post_service_controller_1 = require("./post-service.controller");
let PostServiceModule = class PostServiceModule {
};
exports.PostServiceModule = PostServiceModule;
exports.PostServiceModule = PostServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    uri: configService.get('POST_DB_URI'),
                }),
            }),
            mongoose_1.MongooseModule.forFeature([{ name: post_schema_1.Post.name, schema: post_schema_1.PostSchema }]),
            microservices_1.ClientsModule.registerAsync([
                {
                    name: 'NOTIFICATION_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: async (configService) => ({
                        transport: microservices_1.Transport.RMQ,
                        options: {
                            urls: [configService.get('RABBITMQ_URI')],
                            queue: 'notifications_exchange',
                            persistent: true,
                        },
                    }),
                },
            ]),
        ],
        controllers: [post_service_controller_1.PostServiceController],
        providers: [post_service_service_1.PostService],
    })
], PostServiceModule);
//# sourceMappingURL=post-service.module.js.map