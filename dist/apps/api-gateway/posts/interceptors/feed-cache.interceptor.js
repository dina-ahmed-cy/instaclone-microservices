"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedCacheInterceptor = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const core_1 = require("@nestjs/core");
let FeedCacheInterceptor = class FeedCacheInterceptor extends cache_manager_1.CacheInterceptor {
    constructor(cacheManager, reflector) {
        super(cacheManager, reflector);
        this.cacheManager = cacheManager;
        this.reflector = reflector;
    }
    trackBy(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.sub) {
            return undefined;
        }
        return `feed:${user.sub}`;
    }
};
exports.FeedCacheInterceptor = FeedCacheInterceptor;
exports.FeedCacheInterceptor = FeedCacheInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, core_1.Reflector])
], FeedCacheInterceptor);
//# sourceMappingURL=feed-cache.interceptor.js.map