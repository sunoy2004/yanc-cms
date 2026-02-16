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
exports.TeamController = void 0;
const common_1 = require("@nestjs/common");
const team_service_1 = require("./team.service");
const team_dto_1 = require("../../dtos/team.dto");
const team_update_dto_1 = require("../../dtos/team-update.dto");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let TeamController = class TeamController {
    constructor(teamService) {
        this.teamService = teamService;
    }
    async getPublicTeamMembers(section) {
        return this.teamService.getTeamMembers(section);
    }
    async getPublicTeamMembersByType(type) {
        return this.teamService.getTeamMembersByType(type);
    }
    async createTeamMember(createTeamMemberDto) {
        return this.teamService.createTeamMember(createTeamMemberDto);
    }
    async updateTeamMember(id, updateTeamMemberDto) {
        return this.teamService.updateTeamMember(id, updateTeamMemberDto);
    }
    async deleteTeamMember(id) {
        return this.teamService.deleteTeamMember(id);
    }
    async togglePublish(id, published) {
        const updateDto = { published };
        return this.teamService.updateTeamMember(id, updateDto);
    }
};
exports.TeamController = TeamController;
__decorate([
    (0, common_1.Get)('public'),
    __param(0, (0, common_1.Query)('section')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getPublicTeamMembers", null);
__decorate([
    (0, common_1.Get)('public/:type'),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getPublicTeamMembersByType", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [team_dto_1.CreateTeamMemberDto]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "createTeamMember", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, team_update_dto_1.UpdateTeamMemberDto]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "updateTeamMember", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "deleteTeamMember", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Patch)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('published')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "togglePublish", null);
exports.TeamController = TeamController = __decorate([
    (0, common_1.Controller)('team'),
    __metadata("design:paramtypes", [team_service_1.TeamService])
], TeamController);
//# sourceMappingURL=team.controller.js.map