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
exports.OurMentorsController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const our_mentor_dto_1 = require("../../dtos/our-mentor.dto");
const our_mentors_service_1 = require("./our-mentors.service");
let OurMentorsController = class OurMentorsController {
    constructor(service) {
        this.service = service;
    }
    async listPublic() {
        return this.service.list(true);
    }
    async listAdmin() {
        return this.service.list(false);
    }
    async create(dto) {
        return this.service.create(dto);
    }
    async update(id, dto) {
        return this.service.update(id, dto);
    }
    async remove(id) {
        return this.service.remove(id);
    }
};
exports.OurMentorsController = OurMentorsController;
__decorate([
    (0, common_1.Get)('public'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OurMentorsController.prototype, "listPublic", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OurMentorsController.prototype, "listAdmin", null);
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [our_mentor_dto_1.CreateOurMentorDto]),
    __metadata("design:returntype", Promise)
], OurMentorsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, our_mentor_dto_1.UpdateOurMentorDto]),
    __metadata("design:returntype", Promise)
], OurMentorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OurMentorsController.prototype, "remove", null);
exports.OurMentorsController = OurMentorsController = __decorate([
    (0, common_1.Controller)('our-mentors'),
    __metadata("design:paramtypes", [our_mentors_service_1.OurMentorsService])
], OurMentorsController);
//# sourceMappingURL=our-mentors.controller.js.map