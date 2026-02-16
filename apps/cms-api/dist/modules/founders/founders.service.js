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
var FoundersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoundersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let FoundersService = FoundersService_1 = class FoundersService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(FoundersService_1.name);
    }
    async getFounders() {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                this.logger.warn('Supabase client not available, returning empty founders');
                return [];
            }
            const { data, error } = await supabaseClient
                .from('founders')
                .select('*')
                .filter('is_active', 'eq', true)
                .order('order');
            if (error) {
                this.logger.error('Error fetching founders:', error);
                return [];
            }
            const foundersWithMedia = await Promise.all(data.map(async (founder) => {
                const { data: founderMediaItems, error: mediaError } = await supabaseClient
                    .from('founder_media_item')
                    .select('id, type, url, alt_text, order, created_at, media_id')
                    .eq('founder_id', founder.id)
                    .order('order');
                if (!mediaError && founderMediaItems) {
                    const filteredMediaItems = [];
                    for (const item of founderMediaItems) {
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
                                    createdAt: item.created_at || founder.created_at,
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
                                    createdAt: item.created_at || founder.created_at,
                                });
                            }
                            else {
                                this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
                            }
                        }
                    }
                    this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for founder ${founder.id}`);
                    return { ...founder, mediaItems: filteredMediaItems };
                }
                return founder;
            }));
            return foundersWithMedia;
        }
        catch (error) {
            this.logger.error('Unexpected error fetching founders:', error);
            return [];
        }
    }
    async createFounder(dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log('Creating new founder');
            const { data: newFounder, error: insertError } = await supabaseClient
                .from('founders')
                .insert({
                name: dto.name,
                title: dto.title,
                bio: dto.bio,
                is_active: dto.published ?? true,
                order: dto.order || 0,
            })
                .select()
                .single();
            if (insertError) {
                this.logger.error('Error creating founder:', insertError);
                throw insertError;
            }
            this.logger.log(`✅ Founder created with ID: ${newFounder.id}`);
            if (dto.mediaIds && dto.mediaIds.length > 0) {
                await supabaseClient
                    .from('founder_media_item')
                    .delete()
                    .eq('founder_id', newFounder.id);
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
                            founder_id: newFounder.id,
                            media_id: mediaId,
                            type: 'image',
                            url: url,
                            alt_text: `Founder media item ${i + 1}`,
                            order: i,
                        });
                    }
                    else {
                        this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                    }
                }
                if (mediaAssociations.length > 0) {
                    const { error: mediaError } = await supabaseClient
                        .from('founder_media_item')
                        .insert(mediaAssociations);
                    if (mediaError) {
                        this.logger.error('Error linking media to founder:', mediaError);
                    }
                    else {
                        this.logger.log(`✅ Linked ${mediaAssociations.length} media items to founder`);
                    }
                }
                else {
                    this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for founder ${newFounder.id}`);
                }
            }
            return await this.getFounders();
        }
        catch (error) {
            this.logger.error('Error in createFounder:', error);
            throw error;
        }
    }
    async updateFounder(id, dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Updating founder with ID: ${id}`);
            const updateData = {};
            if (dto.name !== undefined)
                updateData.name = dto.name;
            if (dto.title !== undefined)
                updateData.title = dto.title;
            if (dto.bio !== undefined)
                updateData.bio = dto.bio;
            if (dto.published !== undefined)
                updateData.is_active = dto.published;
            if (dto.order !== undefined)
                updateData.order = dto.order;
            const { data: updatedFounder, error: updateError } = await supabaseClient
                .from('founders')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (updateError) {
                this.logger.error('Error updating founder:', updateError);
                throw updateError;
            }
            this.logger.log(`✅ Founder updated with ID: ${updatedFounder.id}`);
            if (dto.mediaIds !== undefined) {
                await supabaseClient
                    .from('founder_media_item')
                    .delete()
                    .eq('founder_id', id);
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
                                founder_id: id,
                                media_id: mediaId,
                                type: 'image',
                                url: url,
                                alt_text: `Founder media item ${i + 1}`,
                                order: i,
                            });
                        }
                        else {
                            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                        }
                    }
                    if (mediaAssociations.length > 0) {
                        const { error: mediaError } = await supabaseClient
                            .from('founder_media_item')
                            .insert(mediaAssociations);
                        if (mediaError) {
                            this.logger.error('Error updating media associations:', mediaError);
                        }
                        else {
                            this.logger.log(`✅ Updated media associations for founder: ${id}`);
                        }
                    }
                    else {
                        this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for founder ${id}`);
                    }
                }
            }
            return await this.getFounders();
        }
        catch (error) {
            this.logger.error('Error in updateFounder:', error);
            throw error;
        }
    }
    async deleteFounder(id) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Deleting founder with ID: ${id}`);
            const { error } = await supabaseClient
                .from('founders')
                .delete()
                .eq('id', id);
            if (error) {
                this.logger.error('Error deleting founder:', error);
                throw error;
            }
            this.logger.log(`✅ Founder deleted with ID: ${id}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error in deleteFounder:', error);
            throw error;
        }
    }
};
exports.FoundersService = FoundersService;
exports.FoundersService = FoundersService = FoundersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], FoundersService);
//# sourceMappingURL=founders.service.js.map