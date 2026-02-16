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
exports.TestimonialsController = void 0;
const common_1 = require("@nestjs/common");
const testimonials_service_1 = require("./testimonials.service");
const testimonial_dto_1 = require("../../dtos/testimonial.dto");
const testimonial_update_dto_1 = require("../../dtos/testimonial-update.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TestimonialsController = class TestimonialsController {
    constructor(testimonialsService) {
        this.testimonialsService = testimonialsService;
    }
    async getPublicTestimonials() {
        return this.testimonialsService.getTestimonials();
    }
    async createTestimonial(createTestimonialDto) {
        return this.testimonialsService.createTestimonial(createTestimonialDto);
    }
    async updateTestimonial(id, updateTestimonialDto) {
        return this.testimonialsService.updateTestimonial(id, updateTestimonialDto);
    }
    async deleteTestimonial(id) {
        return this.testimonialsService.deleteTestimonial(id);
    }
    async togglePublish(id, published) {
        const updateDto = { published };
        return this.testimonialsService.updateTestimonial(id, updateDto);
    }
};
exports.TestimonialsController = TestimonialsController;
__decorate([
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestimonialsController.prototype, "getPublicTestimonials", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [testimonial_dto_1.CreateTestimonialDto]),
    __metadata("design:returntype", Promise)
], TestimonialsController.prototype, "createTestimonial", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, testimonial_update_dto_1.UpdateTestimonialDto]),
    __metadata("design:returntype", Promise)
], TestimonialsController.prototype, "updateTestimonial", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestimonialsController.prototype, "deleteTestimonial", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('published')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], TestimonialsController.prototype, "togglePublish", null);
exports.TestimonialsController = TestimonialsController = __decorate([
    (0, common_1.Controller)('testimonials'),
    __metadata("design:paramtypes", [testimonials_service_1.TestimonialsService])
], TestimonialsController);
//# sourceMappingURL=testimonials.controller.js.map