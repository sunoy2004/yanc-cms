"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorTalksModule = void 0;
const common_1 = require("@nestjs/common");
const mentor_talks_service_1 = require("./mentor-talks.service");
const mentor_talks_controller_1 = require("./mentor-talks.controller");
const supabase_service_1 = require("../../supabase/supabase.service");
let MentorTalksModule = class MentorTalksModule {
};
exports.MentorTalksModule = MentorTalksModule;
exports.MentorTalksModule = MentorTalksModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [mentor_talks_controller_1.MentorTalksController],
        providers: [mentor_talks_service_1.MentorTalksService, supabase_service_1.SupabaseService],
        exports: [mentor_talks_service_1.MentorTalksService]
    })
], MentorTalksModule);
//# sourceMappingURL=mentor-talks.module.js.map