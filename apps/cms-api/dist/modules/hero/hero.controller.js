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
var HeroController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroController = void 0;
const common_1 = require("@nestjs/common");
const hero_service_1 = require("./hero.service");
const hero_dto_1 = require("../../dtos/hero.dto");
const hero_update_dto_1 = require("../../dtos/hero-update.dto");
let HeroController = HeroController_1 = class HeroController {
    constructor(heroService) {
        this.heroService = heroService;
        this.logger = new common_1.Logger(HeroController_1.name);
    }
    async getHeroContent() {
        this.logger.log('Fetching hero content');
        const content = await this.heroService.getHeroContent();
        if (!content) {
            this.logger.warn('No hero content found');
            return {
                id: null,
                title: 'Welcome to YANC CMS',
                subtitle: 'Your content management system is ready',
                ctaText: 'Get Started',
                ctaUrl: '#',
                mediaItems: [],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        }
        return content;
    }
    async createHeroContent(createHeroDto) {
        this.logger.log('Creating hero content');
        try {
            const content = await this.heroService.createHeroContent(createHeroDto);
            return content;
        }
        catch (error) {
            this.logger.error('Error creating hero content:', error);
            throw error;
        }
    }
    async updateHeroContent(id, updateHeroDto) {
        this.logger.log(`Updating hero content with ID: ${id}`);
        try {
            const content = await this.heroService.updateHeroContent(id, updateHeroDto);
            return content;
        }
        catch (error) {
            this.logger.error('Error updating hero content:', error);
            throw error;
        }
    }
    async deleteHeroContent(id) {
        this.logger.log(`Deleting hero content with ID: ${id}`);
        try {
            const result = await this.heroService.deleteHeroContent(id);
            return result;
        }
        catch (error) {
            this.logger.error('Error deleting hero content:', error);
            throw error;
        }
    }
};
exports.HeroController = HeroController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HeroController.prototype, "getHeroContent", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hero_dto_1.CreateHeroDto]),
    __metadata("design:returntype", Promise)
], HeroController.prototype, "createHeroContent", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, hero_update_dto_1.UpdateHeroDto]),
    __metadata("design:returntype", Promise)
], HeroController.prototype, "updateHeroContent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HeroController.prototype, "deleteHeroContent", null);
exports.HeroController = HeroController = HeroController_1 = __decorate([
    (0, common_1.Controller)('hero'),
    __metadata("design:paramtypes", [hero_service_1.HeroService])
], HeroController);
//# sourceMappingURL=hero.controller.js.map