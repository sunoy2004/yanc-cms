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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const public_decorator_1 = require("./decorators/public.decorator");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async login(loginRequest) {
        const user = await this.authService.validateUser(loginRequest.username, loginRequest.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }
    getMe(req) {
        const user = req.user;
        const userId = Number(user?.userId || user?.sub || 1);
        try {
            return this.authService.getProfile(userId);
        }
        catch (err) {
            this.logger.error('Error fetching profile', err);
            throw new common_1.InternalServerErrorException('Failed to fetch profile');
        }
    }
    updateMe(req, body) {
        const user = req.user;
        const userId = Number(user?.userId || user?.sub || 1);
        try {
            return this.authService.updateProfile(userId, { name: body.name, email: body.email, username: body.username });
        }
        catch (err) {
            this.logger.error('Error updating profile', err);
            throw new common_1.InternalServerErrorException('Failed to update profile');
        }
    }
    async changePassword(req, body) {
        const user = req.user;
        const userId = Number(user?.userId || user?.sub || 1);
        if (!body?.currentPassword || !body?.newPassword) {
            throw new common_1.BadRequestException('currentPassword and newPassword are required');
        }
        try {
            return await this.authService.changePassword(userId, body.currentPassword, body.newPassword);
        }
        catch (err) {
            this.logger.error('Error changing password', err?.message || err);
            if (err.message && err.message.includes('Current password is incorrect')) {
                throw new common_1.UnauthorizedException('Current password is incorrect');
            }
            throw new common_1.InternalServerErrorException(err?.message || 'Failed to change password');
        }
    }
    async createUser(req, body) {
        const current = req.user;
        const userId = Number(current?.userId || current?.sub || 1);
        const email = typeof body?.email === 'string' ? body.email.trim() : '';
        if (!email) {
            throw new common_1.BadRequestException('email is required');
        }
        try {
            const created = await this.authService.createCmsUser(userId, {
                email,
                name: body?.name,
                username: body?.username,
            });
            return created;
        }
        catch (err) {
            this.logger.error('Error creating CMS user', err?.message || err);
            if (err instanceof common_1.ForbiddenException) {
                throw err;
            }
            if (typeof err?.message === 'string' && err.message.includes('already exists')) {
                throw new common_1.BadRequestException(err.message);
            }
            throw new common_1.InternalServerErrorException(err?.message || 'Failed to create user');
        }
    }
    async listUsers(req) {
        const current = req.user;
        const userId = Number(current?.userId || current?.sub || 1);
        try {
            return await this.authService.listCmsUsers(userId);
        }
        catch (err) {
            this.logger.error('Error listing CMS users', err?.message || err);
            if (err instanceof common_1.ForbiddenException) {
                throw err;
            }
            throw new common_1.InternalServerErrorException(err?.message || 'Failed to load users');
        }
    }
    async deleteUser(req, body) {
        const current = req.user;
        const currentUserId = Number(current?.userId || current?.sub || 1);
        const userIdToDelete = Number(body?.userId || 0);
        if (!userIdToDelete || Number.isNaN(userIdToDelete)) {
            throw new common_1.BadRequestException('userId is required');
        }
        try {
            return await this.authService.deleteCmsUser(currentUserId, userIdToDelete);
        }
        catch (err) {
            this.logger.error('Error deleting CMS user', err?.message || err);
            if (err instanceof common_1.ForbiddenException) {
                throw err;
            }
            if (typeof err?.message === 'string' && (err.message.includes('not found') || err.message.includes('Cannot delete'))) {
                throw new common_1.BadRequestException(err.message);
            }
            throw new common_1.InternalServerErrorException(err?.message || 'Failed to delete user');
        }
    }
    async forgotPassword(body) {
        const email = typeof body?.email === 'string' ? body.email.trim() : '';
        if (!email) {
            throw new common_1.BadRequestException('email is required');
        }
        return this.authService.requestPasswordReset(email);
    }
    async resetPassword(body) {
        const token = typeof body?.token === 'string' ? body.token.trim() : '';
        const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
        if (!token || !newPassword) {
            throw new common_1.BadRequestException('token and newPassword are required');
        }
        if (newPassword.length < 8) {
            throw new common_1.BadRequestException('newPassword must be at least 8 characters');
        }
        try {
            return await this.authService.resetPassword(token, newPassword);
        }
        catch (err) {
            if (err.message && (err.message.includes('Invalid or expired') || err.message.includes('not available'))) {
                throw new common_1.BadRequestException(err.message);
            }
            throw new common_1.InternalServerErrorException(err?.message || 'Failed to reset password');
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateMe", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('users'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('users'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "listUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('users/delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteUser", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map