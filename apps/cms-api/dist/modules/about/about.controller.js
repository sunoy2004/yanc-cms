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
exports.AboutController = void 0;
const common_1 = require("@nestjs/common");
const about_service_1 = require("./about.service");
const about_dto_1 = require("../../dtos/about.dto");
const about_update_dto_1 = require("../../dtos/about-update.dto");
let AboutController = class AboutController {
    constructor(aboutService) {
        this.aboutService = aboutService;
    }
    async getPublicAbout() {
        return this.aboutService.getAboutContent();
    }
    async createAbout(createAboutDto) {
        return this.aboutService.createAboutContent(createAboutDto);
    }
    async updateAbout(id, updateAboutDto) {
        return this.aboutService.updateAboutContent(id, updateAboutDto);
    }
    async togglePublish(id, published) {
        const updateDto = { published };
        return this.aboutService.updateAboutContent(id, updateDto);
    }
};
exports.AboutController = AboutController;
__decorate([
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AboutController.prototype, "getPublicAbout", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [about_dto_1.CreateAboutDto]),
    __metadata("design:returntype", Promise)
], AboutController.prototype, "createAbout", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, about_update_dto_1.UpdateAboutDto]),
    __metadata("design:returntype", Promise)
], AboutController.prototype, "updateAbout", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('published')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], AboutController.prototype, "togglePublish", null);
exports.AboutController = AboutController = __decorate([
    (0, common_1.Controller)('about'),
    __metadata("design:paramtypes", [about_service_1.AboutService])
], AboutController);
//# sourceMappingURL=about.controller.js.map