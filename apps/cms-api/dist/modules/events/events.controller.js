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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("./events.service");
const event_dto_1 = require("../../dtos/event.dto");
const event_update_dto_1 = require("../../dtos/event-update.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let EventsController = class EventsController {
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    async getPublicEvents() {
        return this.eventsService.getEvents();
    }
    async getUpcomingEvents() {
        const allEvents = await this.eventsService.getEvents();
        const upcomingEvents = allEvents.filter(event => event.category === 'upcoming' && event.is_active);
        return upcomingEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    }
    async getPastEvents() {
        const allEvents = await this.eventsService.getEvents();
        return allEvents.filter(event => event.category === 'past' && event.is_active);
    }
    async getEventHighlights() {
        const allEvents = await this.eventsService.getEvents();
        return allEvents.filter(event => event.is_active && event.highlights && event.highlights.length > 0);
    }
    async getEventGalleryDeprecated() {
        return [];
    }
    async getEventsByYear(year) {
        const allEvents = await this.eventsService.getEvents();
        return allEvents.filter(event => event.year === parseInt(year) && event.is_active);
    }
    async createEvent(createEventDto) {
        return this.eventsService.createEvent(createEventDto);
    }
    async updateEvent(id, updateEventDto) {
        return this.eventsService.updateEvent(id, updateEventDto);
    }
    async deleteEvent(id) {
        return this.eventsService.deleteEvent(id);
    }
    async togglePublish(id, published) {
        const updateDto = { published };
        return this.eventsService.updateEvent(id, updateDto);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getPublicEvents", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getUpcomingEvents", null);
__decorate([
    (0, common_1.Get)('past'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getPastEvents", null);
__decorate([
    (0, common_1.Get)('highlights'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getEventHighlights", null);
__decorate([
    (0, common_1.Get)('gallery'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getEventGalleryDeprecated", null);
__decorate([
    (0, common_1.Get)('by-year/:year'),
    __param(0, (0, common_1.Param)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getEventsByYear", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "createEvent", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, event_update_dto_1.UpdateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "updateEvent", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "deleteEvent", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Patch)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('published')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "togglePublish", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map