"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_module_1 = require("./supabase/supabase.module");
const database_health_service_1 = require("./common/database-health.service");
const health_controller_1 = require("./common/health.controller");
const app_controller_1 = require("./app.controller");
const media_module_1 = require("./modules/media/media.module");
const hero_module_1 = require("./modules/hero/hero.module");
const programs_module_1 = require("./modules/programs/programs.module");
const events_module_1 = require("./modules/events/events.module");
const team_module_1 = require("./modules/team/team.module");
const founders_module_1 = require("./modules/founders/founders.module");
const testimonials_module_1 = require("./modules/testimonials/testimonials.module");
const about_module_1 = require("./modules/about/about.module");
const auth_module_1 = require("./modules/auth/auth.module");
const event_gallery_items_module_1 = require("./modules/event-gallery-items/event-gallery-items.module");
const mentor_talks_module_1 = require("./modules/mentor-talks/mentor-talks.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
            }),
            supabase_module_1.SupabaseModule,
            auth_module_1.AuthModule,
            media_module_1.MediaModule,
            hero_module_1.HeroModule,
            programs_module_1.ProgramsModule,
            events_module_1.EventsModule,
            team_module_1.TeamModule,
            founders_module_1.FoundersModule,
            testimonials_module_1.TestimonialsModule,
            about_module_1.AboutModule,
            event_gallery_items_module_1.EventGalleryItemsModule,
            mentor_talks_module_1.MentorTalksModule,
        ],
        controllers: [app_controller_1.AppController, health_controller_1.HealthController],
        providers: [database_health_service_1.DatabaseHealthService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map