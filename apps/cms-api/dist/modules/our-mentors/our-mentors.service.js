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
var OurMentorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OurMentorsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let OurMentorsService = OurMentorsService_1 = class OurMentorsService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(OurMentorsService_1.name);
    }
    async list(onlyActive = true) {
        const client = this.supabase.getClient();
        if (!client)
            return [];
        let query = client
            .from('our_mentors')
            .select('id, name, media_id, is_active, display_order, created_at, updated_at')
            .order('display_order', { ascending: true });
        if (onlyActive)
            query = query.eq('is_active', true);
        const { data, error } = await query;
        if (error) {
            this.logger.error('Error listing our_mentors', error);
            return [];
        }
        if (!data?.length)
            return [];
        const mediaIds = data.map((m) => m.media_id).filter(Boolean);
        let mediaMap = new Map();
        if (mediaIds.length) {
            const { data: medias } = await client
                .from('media')
                .select('id, storage_path')
                .in('id', mediaIds);
            mediaMap = new Map((medias || []).map((m) => [m.id, m.storage_path]));
        }
        const base = process.env.SUPABASE_URL;
        return data.map((m) => ({
            id: m.id,
            name: m.name,
            isActive: m.is_active ?? true,
            displayOrder: m.display_order ?? 0,
            createdAt: m.created_at,
            updatedAt: m.updated_at,
            image: m.media_id && mediaMap.get(m.media_id)
                ? {
                    mediaId: m.media_id,
                    url: `${base}/storage/v1/object/public/media/${mediaMap.get(m.media_id)}`,
                }
                : null,
        }));
    }
    async create(dto) {
        const client = this.supabase.getClient();
        if (!client)
            throw new Error('Supabase client not available');
        const insertData = {
            name: dto.name,
            media_id: dto.mediaId ?? null,
            is_active: dto.isActive ?? true,
            display_order: dto.displayOrder ?? 0,
        };
        const { error } = await client.from('our_mentors').insert(insertData);
        if (error)
            throw error;
        return this.list(false);
    }
    async update(id, dto) {
        const client = this.supabase.getClient();
        if (!client)
            throw new Error('Supabase client not available');
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.mediaId !== undefined)
            updateData.media_id = dto.mediaId;
        if (dto.isActive !== undefined)
            updateData.is_active = dto.isActive;
        if (dto.displayOrder !== undefined)
            updateData.display_order = dto.displayOrder;
        const { error } = await client.from('our_mentors').update(updateData).eq('id', id);
        if (error)
            throw error;
        return this.list(false);
    }
    async remove(id) {
        const client = this.supabase.getClient();
        if (!client)
            throw new Error('Supabase client not available');
        const { error } = await client.from('our_mentors').delete().eq('id', id);
        if (error)
            throw error;
        return true;
    }
};
exports.OurMentorsService = OurMentorsService;
exports.OurMentorsService = OurMentorsService = OurMentorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], OurMentorsService);
//# sourceMappingURL=our-mentors.service.js.map