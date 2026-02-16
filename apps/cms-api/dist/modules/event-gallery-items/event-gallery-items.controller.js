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
exports.EventGalleryItemsController = void 0;
const common_1 = require("@nestjs/common");
const event_gallery_items_service_1 = require("./event-gallery-items.service");
const event_gallery_item_dto_1 = require("../../dtos/event-gallery-item.dto");
const event_gallery_item_dto_2 = require("../../dtos/event-gallery-item.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let EventGalleryItemsController = class EventGalleryItemsController {
    constructor(eventGalleryItemsService) {
        this.eventGalleryItemsService = eventGalleryItemsService;
    }
    async getPublicEventGalleryItems() {
        return this.eventGalleryItemsService.getEventGalleryItems();
    }
    async createEventGalleryItem(createDto) {
        return this.eventGalleryItemsService.createEventGalleryItem(createDto);
    }
    async updateEventGalleryItem(id, updateDto) {
        return this.eventGalleryItemsService.updateEventGalleryItem(id, updateDto);
    }
    async deleteEventGalleryItem(id) {
        return this.eventGalleryItemsService.deleteEventGalleryItem(id);
    }
    async togglePublish(id, isActive) {
        return this.eventGalleryItemsService.togglePublish(id, isActive);
    }
};
exports.EventGalleryItemsController = EventGalleryItemsController;
__decorate([
    (0, common_1.Get)('public'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventGalleryItemsController.prototype, "getPublicEventGalleryItems", null);
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_gallery_item_dto_1.CreateEventGalleryItemDto]),
    __metadata("design:returntype", Promise)
], EventGalleryItemsController.prototype, "createEventGalleryItem", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, event_gallery_item_dto_2.UpdateEventGalleryItemDto]),
    __metadata("design:returntype", Promise)
], EventGalleryItemsController.prototype, "updateEventGalleryItem", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventGalleryItemsController.prototype, "deleteEventGalleryItem", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], EventGalleryItemsController.prototype, "togglePublish", null);
exports.EventGalleryItemsController = EventGalleryItemsController = __decorate([
    (0, common_1.Controller)('event-gallery-items'),
    __metadata("design:paramtypes", [event_gallery_items_service_1.EventGalleryItemsService])
], EventGalleryItemsController);
//# sourceMappingURL=event-gallery-items.controller.js.map