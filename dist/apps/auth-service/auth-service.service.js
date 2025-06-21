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
exports.AuthServiceService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
function parseExpirationToSeconds(exp) {
    const match = exp.match(/^(\d+)([smhd])$/);
    if (!match)
        throw new Error('Invalid expiration format');
    const value = parseInt(match[1], 10);
    switch (match[2]) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 24 * 60 * 60;
        default: throw new Error('Invalid expiration unit');
    }
}
let AuthServiceService = class AuthServiceService {
    constructor(redisClient, userClient, jwtService, configService) {
        this.redisClient = redisClient;
        this.userClient = userClient;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async onModuleInit() {
        try {
            console.log('Checking Redis connection...');
            const pong = await this.redisClient.ping();
            if (pong === 'PONG') {
                console.log('Redis connection established successfully.');
            }
            else {
                console.error('Unexpected Redis PING response:', pong);
            }
        }
        catch (err) {
            console.error('Failed to establish Redis connection.', err);
        }
    }
    getHello() {
        return 'Hello World!';
    }
    async hashPassword(password) {
        try {
            const saltRounds = 10;
            return await bcrypt.hash(password, saltRounds);
        }
        catch (error) {
            console.error('Error hashing password:', error);
            throw new common_1.InternalServerErrorException('Error processing password.');
        }
    }
    async comparePasswords(password, storedPasswordHash) {
        try {
            return await bcrypt.compare(password, storedPasswordHash);
        }
        catch (error) {
            console.error('Error comparing passwords:', error);
            throw new common_1.InternalServerErrorException('Error processing password.');
        }
    }
    async generateTokens(user) {
        const payload = { sub: user.id, email: user.email };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        });
        return { accessToken, refreshToken };
    }
    async updateRefreshTokenInRedis(userId, refreshToken) {
        const key = `session:${userId}`;
        const exp = this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME');
        const ttl = parseExpirationToSeconds(exp);
        await this.redisClient.set(key, refreshToken, { EX: ttl });
    }
    async register(dto) {
        try {
            const passwordHash = await this.hashPassword(dto.password);
            const payload = { email: dto.email, passwordHash };
            const user = await (0, rxjs_1.lastValueFrom)(this.userClient.send({ cmd: 'create_user' }, payload));
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    async login(dto) {
        try {
            const user = await (0, rxjs_1.lastValueFrom)(this.userClient.send({ cmd: 'get_user_by_email' }, { email: dto.email }));
            const passwordsMatch = await this.comparePasswords(dto.password, user.passwordHash);
            if (!passwordsMatch) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            delete user.passwordHash;
            const tokens = await this.generateTokens(user);
            await this.updateRefreshTokenInRedis(user.id, tokens.refreshToken);
            return tokens;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    async refreshToken(user) {
        const userId = user.sub;
        const key = `session:${userId}`;
        const storedToken = await this.redisClient.get(key);
        if (!storedToken || storedToken !== user.refreshToken) {
            throw new common_1.UnauthorizedException('Access Denied');
        }
        const newTokens = await this.generateTokens({ id: userId, email: user.email });
        await this.updateRefreshTokenInRedis(userId, newTokens.refreshToken);
        return newTokens;
    }
    async logout(userId) {
        try {
            const key = `session:${userId}`;
            await this.redisClient.del(key);
            return { message: 'Logged out successfully' };
        }
        catch (error) {
            console.error('Logout error:', error);
            throw new common_1.InternalServerErrorException('An error occurred during logout. Please try again.');
        }
    }
};
exports.AuthServiceService = AuthServiceService;
exports.AuthServiceService = AuthServiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __param(1, (0, common_1.Inject)('USER_SERVICE')),
    __metadata("design:paramtypes", [Object, microservices_1.ClientProxy,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthServiceService);
//# sourceMappingURL=auth-service.service.js.map