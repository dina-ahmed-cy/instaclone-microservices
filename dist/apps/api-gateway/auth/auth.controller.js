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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const rxjs_1 = require("rxjs");
const access_token_guard_1 = require("./guards/access-token.guard");
const refresh_token_guard_1 = require("./guards/refresh-token.guard");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("./decorators/public.decorator");
let AuthController = class AuthController {
    constructor(authClient) {
        this.authClient = authClient;
    }
    async register(body) {
        console.log(`Register endpoint called for email: ${body.email}`);
        try {
            const result = await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: 'register' }, body));
            return result;
        }
        catch (error) {
            if (error?.message?.toLowerCase().includes('email') &&
                error?.message?.toLowerCase().includes('exist')) {
                throw new common_1.ConflictException('Email already in use.');
            }
            throw new common_1.InternalServerErrorException('Registration failed.');
        }
    }
    async login(body) {
        try {
            const result = await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: 'login' }, body));
            return result;
        }
        catch (error) {
            throw new common_1.UnauthorizedException();
        }
    }
    async refreshToken(req) {
        const user = req.user;
        const result = await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: 'refresh_token' }, user));
        return result;
    }
    async logout(req) {
        const userId = req.user.sub;
        const result = await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: 'logout' }, { userId }));
        return result;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(201),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully registered. Returns the new user object.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request. Input data is invalid.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflict. Email already exists.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Log in a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful. Returns an access token and a refresh token.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized. Invalid credentials.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.UseGuards)(refresh_token_guard_1.RefreshTokenGuard),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtain a new access token using a refresh token' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully. Returns a new token pair.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized. Refresh token is invalid or expired.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Log out the current user' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout successful.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized. Access token is required.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_2.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], AuthController);
//# sourceMappingURL=auth.controller.js.map