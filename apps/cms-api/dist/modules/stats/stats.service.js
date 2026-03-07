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
var StatsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let StatsService = StatsService_1 = class StatsService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(StatsService_1.name);
    }
    client() {
        return this.supabase.getClient();
    }
    async countTable(table, publishedColumn = 'is_active') {
        const client = this.client();
        if (!client)
            return { total: 0, published: 0 };
        try {
            const [{ count: total }, { count: published }] = await Promise.all([
                client.from(table).select('id', { count: 'exact', head: true }),
                client.from(table).select('id', { count: 'exact', head: true }).neq(publishedColumn, null).eq(publishedColumn, true),
            ]);
            return { total: Number(total) || 0, published: Number(published) || 0 };
        }
        catch (err) {
            this.logger.error(`Error counting table ${table}`, err);
            return { total: 0, published: 0 };
        }
    }
    async getEventsTotal() {
        const client = this.client();
        if (!client)
            return { total: 0, published: 0 };
        try {
            const [upcoming, past, gallery] = await Promise.all([
                client.from('event_content').select('id', { count: 'exact', head: true }).eq('category', 'upcoming'),
                client.from('event_content').select('id', { count: 'exact', head: true }).eq('category', 'past'),
                client.from('event_gallery_items').select('id', { count: 'exact', head: true }),
            ]);
            const total = (Number(upcoming.count) || 0) + (Number(past.count) || 0) + (Number(gallery.count) || 0);
            const [upcomingPub, pastPub] = await Promise.all([
                client.from('event_content').select('id', { count: 'exact', head: true }).eq('category', 'upcoming').eq('is_active', true),
                client.from('event_content').select('id', { count: 'exact', head: true }).eq('category', 'past').eq('is_active', true),
            ]);
            const published = (Number(upcomingPub.count) || 0) + (Number(pastPub.count) || 0);
            return { total, published };
        }
        catch (err) {
            this.logger.error('Error counting events total', err);
            return { total: 0, published: 0 };
        }
    }
    async getStats() {
        const events = await this.getEventsTotal();
        const team = await this.countTable('team_members', 'is_active');
        const programs = await this.countTable('programs', 'is_active');
        const testimonials = await this.countTable('testimonials', 'is_active');
        return {
            events,
            team,
            programs,
            testimonials,
        };
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = StatsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], StatsService);
//# sourceMappingURL=stats.service.js.map