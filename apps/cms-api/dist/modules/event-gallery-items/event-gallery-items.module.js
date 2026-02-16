"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventGalleryItemsModule = void 0;
const common_1 = require("@nestjs/common");
const event_gallery_items_controller_1 = require("./event-gallery-items.controller");
const event_gallery_items_service_1 = require("./event-gallery-items.service");
const supabase_module_1 = require("../../supabase/supabase.module");
let EventGalleryItemsModule = class EventGalleryItemsModule {
};
exports.EventGalleryItemsModule = EventGalleryItemsModule;
exports.EventGalleryItemsModule = EventGalleryItemsModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule],
        controllers: [event_gallery_items_controller_1.EventGalleryItemsController],
        providers: [event_gallery_items_service_1.EventGalleryItemsService],
        exports: [event_gallery_items_service_1.EventGalleryItemsService],
    })
], EventGalleryItemsModule);
//# sourceMappingURL=event-gallery-items.module.js.map