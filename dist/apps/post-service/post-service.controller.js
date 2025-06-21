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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostServiceController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const post_service_service_1 = require("./post-service.service");
let PostServiceController = class PostServiceController {
    constructor(postService) {
        this.postService = postService;
    }
    async createPost(data) {
        return this.postService.createPost(data);
    }
    async getPostsForUser({ userId }) {
        return this.postService.getPostsForUser(userId);
    }
};
exports.PostServiceController = PostServiceController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create_post' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostServiceController.prototype, "createPost", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_posts_for_user' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostServiceController.prototype, "getPostsForUser", null);
exports.PostServiceController = PostServiceController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [post_service_service_1.PostService])
], PostServiceController);
//# sourceMappingURL=post-service.controller.js.map