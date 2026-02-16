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
var HeroService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let HeroService = HeroService_1 = class HeroService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(HeroService_1.name);
    }
    async getHeroContent() {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                this.logger.warn('Supabase client not available, returning empty hero content');
                return null;
            }
            const { data, error } = await supabaseClient
                .from('hero_content')
                .select('*')
                .filter('is_active', 'eq', true)
                .limit(1)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    this.logger.log('No active hero content found');
                    return null;
                }
                this.logger.error('Error fetching hero content:', error);
                return null;
            }
            if (data && data.id) {
                const { data: heroMediaItems, error: mediaError } = await supabaseClient
                    .from('hero_media_item')
                    .select('id, type, url, alt_text, order, created_at, media_id')
                    .eq('hero_id', data.id)
                    .order('order');
                if (!mediaError && heroMediaItems) {
                    const filteredMediaItems = [];
                    for (const item of heroMediaItems) {
                        if (item.media_id) {
                            const { data: mediaRecord, error: mediaRecordError } = await supabaseClient
                                .from('media')
                                .select('storage_path')
                                .eq('id', item.media_id)
                                .single();
                            if (!mediaRecordError && mediaRecord && mediaRecord.storage_path) {
                                const supabaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaRecord.storage_path}`;
                                filteredMediaItems.push({
                                    id: item.id,
                                    type: item.type === 'image' ? 'image' : 'video',
                                    url: supabaseUrl,
                                    alt: item.alt_text,
                                    order: item.order,
                                    createdAt: item.created_at || data.created_at,
                                });
                            }
                            else {
                                this.logger.warn(`⚠️ Filtering out media item ${item.id} - no storage path found`);
                            }
                        }
                        else {
                            if (item.url && item.url.includes('supabase.co/storage')) {
                                filteredMediaItems.push({
                                    id: item.id,
                                    type: item.type === 'image' ? 'image' : 'video',
                                    url: item.url,
                                    alt: item.alt_text,
                                    order: item.order,
                                    createdAt: item.created_at || data.created_at,
                                });
                            }
                            else {
                                this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
                            }
                        }
                    }
                    this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for hero ${data.id}`);
                    const transformedData = {
                        ...data,
                        ctaText: data.cta_text || '',
                        ctaUrl: data.cta_url || '',
                        mediaItems: filteredMediaItems
                    };
                    delete transformedData.cta_text;
                    delete transformedData.cta_url;
                    return transformedData;
                }
            }
            const transformedData = {
                ...data,
                ctaText: data.cta_text || '',
                ctaUrl: data.cta_url || ''
            };
            delete transformedData.cta_text;
            delete transformedData.cta_url;
            return transformedData;
        }
        catch (error) {
            this.logger.error('Unexpected error fetching hero content:', error);
            return null;
        }
    }
    async createHeroContent(dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log('Creating new hero content');
            const { error: updateError } = await supabaseClient
                .from('hero_content')
                .update({ is_active: false })
                .eq('is_active', true);
            if (updateError) {
                this.logger.error('Error deactivating existing hero content:', updateError);
                throw updateError;
            }
            const { data: newHero, error: insertError } = await supabaseClient
                .from('hero_content')
                .insert({
                title: dto.title,
                subtitle: dto.subtitle || '',
                description: dto.description || '',
                cta_text: dto.ctaText || '',
                cta_url: dto.ctaLink || dto.cta_url || '',
                is_active: dto.published ?? true,
            })
                .select()
                .single();
            if (insertError) {
                this.logger.error('Error creating hero content:', insertError);
                throw insertError;
            }
            this.logger.log(`✅ Hero content created with ID: ${newHero.id}`);
            if (dto.mediaIds && dto.mediaIds.length > 0) {
                await supabaseClient
                    .from('hero_media_item')
                    .delete()
                    .eq('hero_id', newHero.id);
                const mediaAssociations = [];
                for (let i = 0; i < dto.mediaIds.length; i++) {
                    const mediaId = dto.mediaIds[i];
                    const { data: mediaItem, error: mediaError } = await supabaseClient
                        .from('media')
                        .select('storage_path, storage_type')
                        .eq('id', mediaId)
                        .single();
                    if (mediaError) {
                        this.logger.error(`Error fetching media item ${mediaId}:`, mediaError);
                        continue;
                    }
                    if (mediaItem.storage_path) {
                        const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaItem.storage_path}`;
                        mediaAssociations.push({
                            hero_id: newHero.id,
                            media_id: mediaId,
                            type: 'image',
                            url: url,
                            alt_text: `Hero media item ${i + 1}`,
                            order: i,
                        });
                    }
                    else {
                        this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                    }
                }
                if (mediaAssociations.length > 0) {
                    const { error: mediaError } = await supabaseClient
                        .from('hero_media_item')
                        .insert(mediaAssociations);
                    if (mediaError) {
                        this.logger.error('Error linking media to hero:', mediaError);
                    }
                    else {
                        this.logger.log(`✅ Linked ${mediaAssociations.length} media items to hero`);
                    }
                }
                else {
                    this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for hero ${newHero.id}`);
                }
            }
            return await this.getHeroContent();
        }
        catch (error) {
            this.logger.error('Error in createHeroContent:', error);
            throw error;
        }
    }
    async updateHeroContent(id, dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Updating hero content with ID: ${id}`);
            if (dto.published !== undefined && dto.published === true) {
                const { error: updateError } = await supabaseClient
                    .from('hero_content')
                    .update({ is_active: false })
                    .neq('id', id)
                    .eq('is_active', true);
                if (updateError) {
                    this.logger.error('Error deactivating other hero content:', updateError);
                    throw updateError;
                }
            }
            const updateData = {};
            if (dto.title !== undefined)
                updateData.title = dto.title;
            if (dto.subtitle !== undefined)
                updateData.subtitle = dto.subtitle;
            if (dto.description !== undefined)
                updateData.description = dto.description;
            if (dto.ctaText !== undefined)
                updateData.cta_text = dto.ctaText;
            if (dto.ctaLink !== undefined)
                updateData.cta_url = dto.ctaLink;
            if (dto.cta_url !== undefined)
                updateData.cta_url = dto.cta_url;
            if (dto.published !== undefined)
                updateData.is_active = dto.published;
            const { data: updatedHero, error: updateError } = await supabaseClient
                .from('hero_content')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (updateError) {
                this.logger.error('Error updating hero content:', updateError);
                throw updateError;
            }
            this.logger.log(`✅ Hero content updated with ID: ${updatedHero.id}`);
            if (dto.mediaIds !== undefined) {
                await supabaseClient
                    .from('hero_media_item')
                    .delete()
                    .eq('hero_id', id);
                if (dto.mediaIds && dto.mediaIds.length > 0) {
                    const mediaAssociations = [];
                    for (let i = 0; i < dto.mediaIds.length; i++) {
                        const mediaId = dto.mediaIds[i];
                        const { data: mediaItem, error: mediaError } = await supabaseClient
                            .from('media')
                            .select('storage_path, drive_id, storage_type')
                            .eq('id', mediaId)
                            .single();
                        if (mediaError) {
                            this.logger.error(`Error fetching media item ${mediaId}:`, mediaError);
                            continue;
                        }
                        if (mediaItem.storage_path) {
                            const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaItem.storage_path}`;
                            mediaAssociations.push({
                                hero_id: id,
                                media_id: mediaId,
                                type: 'image',
                                url: url,
                                alt_text: `Hero media item ${i + 1}`,
                                order: i,
                            });
                        }
                        else {
                            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                        }
                    }
                    if (mediaAssociations.length > 0) {
                        const { error: mediaError } = await supabaseClient
                            .from('hero_media_item')
                            .insert(mediaAssociations);
                        if (mediaError) {
                            this.logger.error('Error updating media associations:', mediaError);
                        }
                        else {
                            this.logger.log(`✅ Updated media associations for hero: ${id}`);
                        }
                    }
                    else {
                        this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for hero ${id}`);
                    }
                }
            }
            return await this.getHeroContent();
        }
        catch (error) {
            this.logger.error('Error in updateHeroContent:', error);
            throw error;
        }
    }
    async deleteHeroContent(id) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Deleting hero content with ID: ${id}`);
            const { error: mediaDeleteError } = await supabaseClient
                .from('hero_media_item')
                .delete()
                .eq('hero_id', id);
            if (mediaDeleteError) {
                this.logger.error('Error deleting hero media associations:', mediaDeleteError);
            }
            else {
                this.logger.log(`✅ Deleted media associations for hero ${id}`);
            }
            const { error: heroDeleteError } = await supabaseClient
                .from('hero_content')
                .delete()
                .eq('id', id);
            if (heroDeleteError) {
                this.logger.error('Error deleting hero content:', heroDeleteError);
                throw heroDeleteError;
            }
            this.logger.log(`✅ Hero content deleted with ID: ${id}`);
            return { success: true, message: 'Hero content deleted successfully' };
        }
        catch (error) {
            this.logger.error('Error in deleteHeroContent:', error);
            throw error;
        }
    }
};
exports.HeroService = HeroService;
exports.HeroService = HeroService = HeroService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], HeroService);
//# sourceMappingURL=hero.service.js.map