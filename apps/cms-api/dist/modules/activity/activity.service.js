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
var ActivityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ActivityService = ActivityService_1 = class ActivityService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(ActivityService_1.name);
    }
    client() {
        return this.supabase.getClient();
    }
    async getRecent(limit = 10) {
        const client = this.client();
        if (!client)
            return [];
        try {
            const queries = [
                client
                    .from('events')
                    .select('id,title,created_at,updated_at,is_active')
                    .order('updated_at', { ascending: false })
                    .limit(limit),
                client
                    .from('team_members')
                    .select('id,name,created_at,updated_at,is_active')
                    .order('updated_at', { ascending: false })
                    .limit(limit),
                client
                    .from('programs')
                    .select('id,title,created_at,updated_at,is_active')
                    .order('updated_at', { ascending: false })
                    .limit(limit),
                client
                    .from('hero_content')
                    .select('id,title,created_at,updated_at,is_active')
                    .order('updated_at', { ascending: false })
                    .limit(limit),
                client
                    .from('testimonials')
                    .select('id,name,created_at,updated_at,is_active')
                    .order('updated_at', { ascending: false })
                    .limit(limit),
            ];
            const results = await Promise.all(queries);
            const normalize = (rows, type) => (rows || []).map((r) => ({
                id: r.id,
                action: new Date(r.created_at).getTime() === new Date(r.updated_at).getTime() ? 'create' : 'update',
                contentType: type,
                contentTitle: r.title || r.name || '',
                user: 'system',
                timestamp: r.updated_at,
            }));
            const [events, team, programs, hero, testimonials] = results.map((r) => (r.data ? r.data : []));
            const merged = [
                ...normalize(events, 'Event'),
                ...normalize(team, 'Team Member'),
                ...normalize(programs, 'Program'),
                ...normalize(hero, 'Hero Content'),
                ...normalize(testimonials, 'Testimonial'),
            ];
            merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            return merged.slice(0, limit);
        }
        catch (err) {
            this.logger.error('Error fetching recent activity', err);
            return [];
        }
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = ActivityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ActivityService);
//# sourceMappingURL=activity.service.js.map