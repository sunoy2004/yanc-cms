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
var DatabaseHealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseHealthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let DatabaseHealthService = DatabaseHealthService_1 = class DatabaseHealthService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(DatabaseHealthService_1.name);
    }
    async onModuleInit() {
        await this.validateDatabaseConnection();
    }
    async validateDatabaseConnection() {
        try {
            this.logger.log('Validating database connection...');
            const isHealthy = await this.supabase.healthCheck();
            if (isHealthy) {
                this.logger.log('✅ Database connection validated successfully');
            }
            else {
                throw new Error('Supabase health check failed');
            }
        }
        catch (error) {
            this.logger.error('❌ Database connection validation failed:', error);
            this.logger.error('SUPABASE_URL:', process.env.SUPABASE_URL?.substring(0, 50) + '...');
            this.logger.warn('⚠️  Application will start in degraded mode - database operations may fail');
        }
    }
    async isDatabaseHealthy() {
        try {
            return await this.supabase.healthCheck();
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            return false;
        }
    }
};
exports.DatabaseHealthService = DatabaseHealthService;
exports.DatabaseHealthService = DatabaseHealthService = DatabaseHealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], DatabaseHealthService);
//# sourceMappingURL=database-health.service.js.map