"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_1 = require("redis");
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: 'REDIS_CLIENT',
                useFactory: async (configService) => {
                    const client = (0, redis_1.createClient)({
                        socket: {
                            host: configService.get('REDIS_HOST'),
                            port: Number(configService.get('REDIS_PORT')),
                        },
                        password: configService.get('REDIS_PASSWORD') || undefined,
                    });
                    client.on('error', (err) => {
                        console.error('Redis Client Error', err);
                    });
                    await client.connect();
                    return client;
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: ['REDIS_CLIENT'],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map