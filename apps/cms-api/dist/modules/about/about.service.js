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
var AboutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let AboutService = AboutService_1 = class AboutService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(AboutService_1.name);
    }
    async getAboutContent() {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                this.logger.warn('Supabase client not available, returning empty about content');
                return null;
            }
            const { data, error } = await supabaseClient
                .from('about_us')
                .select('*')
                .filter('is_active', 'eq', true)
                .limit(1)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    this.logger.log('No active about content found');
                    return null;
                }
                this.logger.error('Error fetching about content:', error);
                return null;
            }
            if (data && data.id) {
                const { data: aboutMediaItems, error: mediaError } = await supabaseClient
                    .from('about_us_media_item')
                    .select('id, type, url, alt_text, order, created_at, media_id')
                    .eq('about_us_id', data.id)
                    .order('order');
                if (!mediaError && aboutMediaItems) {
                    const filteredMediaItems = [];
                    for (const item of aboutMediaItems) {
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
                    this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for about ${data.id}`);
                    return { ...data, mediaItems: filteredMediaItems };
                }
            }
            return data;
        }
        catch (error) {
            this.logger.error('Unexpected error fetching about content:', error);
            return null;
        }
    }
    async createAboutContent(dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log('Creating new about content');
            const { error: updateError } = await supabaseClient
                .from('about_us')
                .update({ is_active: false })
                .eq('is_active', true);
            if (updateError) {
                this.logger.error('Error deactivating existing about content:', updateError);
                throw updateError;
            }
            const { data: newAbout, error: insertError } = await supabaseClient
                .from('about_us')
                .insert({
                headline: dto.headline,
                description: dto.description || '',
                vision_title: dto.visionTitle || '',
                vision_desc: dto.visionDesc || '',
                mission_title: dto.missionTitle || '',
                mission_desc: dto.missionDesc || '',
                is_active: dto.published ?? true,
            })
                .select()
                .single();
            if (insertError) {
                this.logger.error('Error creating about content:', insertError);
                throw insertError;
            }
            this.logger.log(`✅ About content created with ID: ${newAbout.id}`);
            if (dto.mediaIds && dto.mediaIds.length > 0) {
                await supabaseClient
                    .from('about_us_media_item')
                    .delete()
                    .eq('about_us_id', newAbout.id);
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
                            about_us_id: newAbout.id,
                            media_id: mediaId,
                            type: 'image',
                            url: url,
                            alt_text: `About content media item ${i + 1}`,
                            order: i,
                        });
                    }
                    else {
                        this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                    }
                }
                if (mediaAssociations.length > 0) {
                    const { error: mediaError } = await supabaseClient
                        .from('about_us_media_item')
                        .insert(mediaAssociations);
                    if (mediaError) {
                        this.logger.error('Error linking media to about content:', mediaError);
                    }
                    else {
                        this.logger.log(`✅ Linked ${mediaAssociations.length} media items to about content`);
                    }
                }
                else {
                    this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for about content ${newAbout.id}`);
                }
            }
            return await this.getAboutContent();
        }
        catch (error) {
            this.logger.error('Error in createAboutContent:', error);
            throw error;
        }
    }
    async updateAboutContent(id, dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Updating about content with ID: ${id}`);
            if (dto.published !== undefined && dto.published === true) {
                const { error: updateError } = await supabaseClient
                    .from('about_us')
                    .update({ is_active: false })
                    .neq('id', id)
                    .eq('is_active', true);
                if (updateError) {
                    this.logger.error('Error deactivating other about content:', updateError);
                    throw updateError;
                }
            }
            const updateData = {};
            if (dto.headline !== undefined)
                updateData.headline = dto.headline;
            if (dto.description !== undefined)
                updateData.description = dto.description;
            if (dto.visionTitle !== undefined)
                updateData.vision_title = dto.visionTitle;
            if (dto.visionDesc !== undefined)
                updateData.vision_desc = dto.visionDesc;
            if (dto.missionTitle !== undefined)
                updateData.mission_title = dto.missionTitle;
            if (dto.missionDesc !== undefined)
                updateData.mission_desc = dto.missionDesc;
            if (dto.published !== undefined)
                updateData.is_active = dto.published;
            const { data: updatedAbout, error: updateError } = await supabaseClient
                .from('about_us')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (updateError) {
                this.logger.error('Error updating about content:', updateError);
                throw updateError;
            }
            this.logger.log(`✅ About content updated with ID: ${updatedAbout.id}`);
            if (dto.mediaIds !== undefined) {
                await supabaseClient
                    .from('about_us_media_item')
                    .delete()
                    .eq('about_us_id', id);
                if (dto.mediaIds && dto.mediaIds.length > 0) {
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
                                about_us_id: id,
                                media_id: mediaId,
                                type: 'image',
                                url: url,
                                alt_text: `About content media item ${i + 1}`,
                                order: i,
                            });
                        }
                        else {
                            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                        }
                    }
                    if (mediaAssociations.length > 0) {
                        const { error: mediaError } = await supabaseClient
                            .from('about_us_media_item')
                            .insert(mediaAssociations);
                        if (mediaError) {
                            this.logger.error('Error updating media associations:', mediaError);
                        }
                        else {
                            this.logger.log(`✅ Updated media associations for about content: ${id}`);
                        }
                    }
                    else {
                        this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for about content ${id}`);
                    }
                }
            }
            return await this.getAboutContent();
        }
        catch (error) {
            this.logger.error('Error in updateAboutContent:', error);
            throw error;
        }
    }
};
exports.AboutService = AboutService;
exports.AboutService = AboutService = AboutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AboutService);
//# sourceMappingURL=about.service.js.map