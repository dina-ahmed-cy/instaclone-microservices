"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const microservices_1 = require("@nestjs/microservices");
const api_gateway_controller_1 = require("./api-gateway.controller");
const api_gateway_service_1 = require("./api-gateway.service");
const auth_controller_1 = require("./auth/auth.controller");
const access_token_strategy_1 = require("./auth/strategies/access-token.strategy");
const refresh_token_strategy_1 = require("./auth/strategies/refresh-token.strategy");
const posts_controller_1 = require("./posts/posts.controller");
const redisStore = require("cache-manager-redis-store");
let ApiGatewayModule = class ApiGatewayModule {
};
exports.ApiGatewayModule = ApiGatewayModule;
exports.ApiGatewayModule = ApiGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    store: redisStore,
                    socket: {
                        host: configService.get('REDIS_HOST'),
                        port: parseInt(configService.get('REDIS_PORT'), 10),
                    },
                }),
            }),
            microservices_1.ClientsModule.registerAsync([
                {
                    name: 'AUTH_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: async (configService) => ({
                        transport: microservices_1.Transport.TCP,
                        options: {
                            host: configService.get('AUTH_SERVICE_HOST'),
                            port: parseInt(configService.get('AUTH_SERVICE_TCP_PORT'), 10),
                        },
                    }),
                },
                {
                    name: 'USER_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: async (configService) => ({
                        transport: microservices_1.Transport.TCP,
                        options: {
                            host: configService.get('USER_SERVICE_HOST'),
                            port: parseInt(configService.get('USER_SERVICE_TCP_PORT'), 10),
                        },
                    }),
                },
                {
                    name: 'POST_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: async (configService) => ({
                        transport: microservices_1.Transport.TCP,
                        options: {
                            host: configService.get('POST_SERVICE_HOST'),
                            port: parseInt(configService.get('POST_SERVICE_TCP_PORT'), 10),
                        },
                    }),
                },
            ]),
        ],
        controllers: [api_gateway_controller_1.ApiGatewayController, auth_controller_1.AuthController, posts_controller_1.PostsController],
        providers: [api_gateway_service_1.ApiGatewayService, access_token_strategy_1.AccessTokenStrategy, refresh_token_strategy_1.RefreshTokenStrategy],
    })
], ApiGatewayModule);
//# sourceMappingURL=api-gateway.module.js.map