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
var HealthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const database_health_service_1 = require("./database-health.service");
let HealthController = HealthController_1 = class HealthController {
    constructor(databaseHealthService) {
        this.databaseHealthService = databaseHealthService;
        this.logger = new common_1.Logger(HealthController_1.name);
    }
    healthCheck() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    async databaseHealth() {
        const isHealthy = await this.databaseHealthService.isDatabaseHealthy();
        return {
            database: isHealthy ? 'connected' : 'unavailable',
            timestamp: new Date().toISOString()
        };
    }
    environmentCheck() {
        const redactedEnv = {
            supabaseUrl: process.env.SUPABASE_URL ? '[SET]' : '[NOT SET]',
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]',
            supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[NOT SET]',
            googleProjectId: process.env.GOOGLE_PROJECT_ID ? '[SET]' : '[NOT SET]',
            googleDriveRootFolder: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ? '[SET]' : '[NOT SET]',
            googleSharedDrive: process.env.GOOGLE_SHARED_DRIVE_ID ? '[SET]' : '[NOT SET]',
            nodeEnv: process.env.NODE_ENV || 'development',
            port: process.env.PORT || '3001',
            timestamp: new Date().toISOString()
        };
        return redactedEnv;
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('db'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "databaseHealth", null);
__decorate([
    (0, common_1.Get)('env'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "environmentCheck", null);
exports.HealthController = HealthController = HealthController_1 = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [database_health_service_1.DatabaseHealthService])
], HealthController);
//# sourceMappingURL=health.controller.js.map