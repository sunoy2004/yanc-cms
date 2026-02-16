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
exports.MentorTalksController = void 0;
const common_1 = require("@nestjs/common");
const mentor_talks_service_1 = require("./mentor-talks.service");
const mentor_talk_dto_1 = require("../../dtos/mentor-talk.dto");
const mentor_talk_update_dto_1 = require("../../dtos/mentor-talk-update.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let MentorTalksController = class MentorTalksController {
    constructor(mentorTalksService) {
        this.mentorTalksService = mentorTalksService;
    }
    async getPublicMentorTalks() {
        return this.mentorTalksService.getMentorTalks();
    }
    async getAllMentorTalks() {
        return this.mentorTalksService.getAllMentorTalks();
    }
    async createMentorTalk(createMentorTalkDto) {
        return this.mentorTalksService.createMentorTalk(createMentorTalkDto);
    }
    async updateMentorTalk(id, updateMentorTalkDto) {
        return this.mentorTalksService.updateMentorTalk(id, updateMentorTalkDto);
    }
    async deleteMentorTalk(id) {
        return this.mentorTalksService.deleteMentorTalk(id);
    }
    async togglePublish(id, published) {
        const updateDto = { published };
        return this.mentorTalksService.updateMentorTalk(id, updateDto);
    }
};
exports.MentorTalksController = MentorTalksController;
__decorate([
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MentorTalksController.prototype, "getPublicMentorTalks", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MentorTalksController.prototype, "getAllMentorTalks", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mentor_talk_dto_1.CreateMentorTalkDto]),
    __metadata("design:returntype", Promise)
], MentorTalksController.prototype, "createMentorTalk", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, mentor_talk_update_dto_1.UpdateMentorTalkDto]),
    __metadata("design:returntype", Promise)
], MentorTalksController.prototype, "updateMentorTalk", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MentorTalksController.prototype, "deleteMentorTalk", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Put)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('published')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], MentorTalksController.prototype, "togglePublish", null);
exports.MentorTalksController = MentorTalksController = __decorate([
    (0, common_1.Controller)('mentor-talks'),
    __metadata("design:paramtypes", [mentor_talks_service_1.MentorTalksService])
], MentorTalksController);
//# sourceMappingURL=mentor-talks.controller.js.map