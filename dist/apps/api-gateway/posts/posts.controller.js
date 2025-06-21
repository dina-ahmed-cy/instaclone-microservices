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
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const create_post_dto_1 = require("./dto/create-post.dto");
const access_token_guard_1 = require("../auth/guards/access-token.guard");
const swagger_1 = require("@nestjs/swagger");
const cache_manager_1 = require("@nestjs/cache-manager");
const feed_cache_interceptor_1 = require("./interceptors/feed-cache.interceptor");
const cache_manager_2 = require("@nestjs/cache-manager");
const microservices_2 = require("@nestjs/microservices");
let PostsController = class PostsController {
    constructor(postClient, cacheManager) {
        this.postClient = postClient;
        this.cacheManager = cacheManager;
    }
    async createPost(req, body) {
        const userId = req.user.sub;
        const payload = { userId, ...body };
        const result = await (0, rxjs_1.lastValueFrom)(this.postClient.send({ cmd: 'create_post' }, payload));
        return result;
    }
    async getFeed(req) {
        const userId = req.user.sub;
        const result = await (0, rxjs_1.lastValueFrom)(this.postClient.send({ cmd: 'get_posts_for_user' }, { userId }));
        return result;
    }
    async handlePostCreated(data) {
        console.log('Received post_created event, payload:', data);
        const userId = data.userId;
        if (!userId) {
            console.error('Cannot invalidate cache: userId is missing from post_created event payload.');
            return;
        }
        const cacheKey = `feed:${userId}`;
        console.log(`Invalidating cache key: ${cacheKey}`);
        try {
            await this.cacheManager.del(cacheKey);
            console.log(`Cache invalidated for key: ${cacheKey}`);
        }
        catch (error) {
            console.error(`Failed to invalidate cache for key: ${cacheKey}`, error);
        }
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new post' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Post created successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request. Invalid input data.' }),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_post_dto_1.CreatePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)('/feed'),
    (0, common_1.UseInterceptors)(feed_cache_interceptor_1.FeedCacheInterceptor),
    (0, cache_manager_2.CacheTTL)(3600),
    (0, swagger_1.ApiOperation)({ summary: "Get the personal post feed for the logged-in user" }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Successfully retrieved the user's posts. Returns an array of post objects." }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized. A valid access token is required.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getFeed", null);
__decorate([
    (0, microservices_2.EventPattern)('post_created'),
    __param(0, (0, microservices_2.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "handlePostCreated", null);
exports.PostsController = PostsController = __decorate([
    (0, swagger_1.ApiTags)('Posts'),
    (0, common_1.Controller)('posts'),
    __param(0, (0, common_2.Inject)('POST_SERVICE')),
    __param(1, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [microservices_1.ClientProxy, Object])
], PostsController);
//# sourceMappingURL=posts.controller.js.map