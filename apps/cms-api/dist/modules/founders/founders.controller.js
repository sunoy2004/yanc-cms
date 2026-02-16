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
exports.FoundersController = void 0;
const common_1 = require("@nestjs/common");
const founders_service_1 = require("./founders.service");
const founder_dto_1 = require("../../dtos/founder.dto");
const founder_update_dto_1 = require("../../dtos/founder-update.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let FoundersController = class FoundersController {
    constructor(foundersService) {
        this.foundersService = foundersService;
    }
    async getPublicFounders() {
        return this.foundersService.getFounders();
    }
    async createFounder(createFounderDto) {
        return this.foundersService.createFounder(createFounderDto);
    }
    async updateFounder(id, updateFounderDto) {
        return this.foundersService.updateFounder(id, updateFounderDto);
    }
    async deleteFounder(id) {
        return this.foundersService.deleteFounder(id);
    }
    async togglePublish(id, published) {
        const updateDto = { published };
        return this.foundersService.updateFounder(id, updateDto);
    }
};
exports.FoundersController = FoundersController;
__decorate([
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FoundersController.prototype, "getPublicFounders", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [founder_dto_1.CreateFounderDto]),
    __metadata("design:returntype", Promise)
], FoundersController.prototype, "createFounder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, founder_update_dto_1.UpdateFounderDto]),
    __metadata("design:returntype", Promise)
], FoundersController.prototype, "updateFounder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FoundersController.prototype, "deleteFounder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('published')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], FoundersController.prototype, "togglePublish", null);
exports.FoundersController = FoundersController = __decorate([
    (0, common_1.Controller)('founders'),
    __metadata("design:paramtypes", [founders_service_1.FoundersService])
], FoundersController);
//# sourceMappingURL=founders.controller.js.map