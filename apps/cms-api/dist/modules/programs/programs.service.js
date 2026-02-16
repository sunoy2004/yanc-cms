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
var ProgramsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ProgramsService = ProgramsService_1 = class ProgramsService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(ProgramsService_1.name);
    }
    async getPrograms() {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                this.logger.warn('Supabase client not available, returning empty programs');
                return [];
            }
            const { data, error } = await supabaseClient
                .from('program_content')
                .select('*')
                .filter('is_active', 'eq', true)
                .order('order');
            if (error) {
                this.logger.error('Error fetching programs:', error);
                return [];
            }
            const programsWithMedia = await Promise.all(data.map(async (program) => {
                const { data: programMediaItems, error: mediaError } = await supabaseClient
                    .from('program_media_item')
                    .select('id, type, url, alt_text, order, created_at, media_id')
                    .eq('program_id', program.id)
                    .order('order');
                if (!mediaError && programMediaItems) {
                    const filteredMediaItems = [];
                    for (const item of programMediaItems) {
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
                                    createdAt: item.created_at || program.created_at,
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
                                    createdAt: item.created_at || program.created_at,
                                });
                            }
                            else {
                                this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
                            }
                        }
                    }
                    this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for program ${program.id}`);
                    return { ...program, mediaItems: filteredMediaItems };
                }
                return program;
            }));
            return programsWithMedia;
        }
        catch (error) {
            this.logger.error('Unexpected error fetching programs:', error);
            return [];
        }
    }
    async createProgram(dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log('Creating new program');
            const { data: newProgram, error: insertError } = await supabaseClient
                .from('program_content')
                .insert({
                title: dto.title,
                description: dto.description || '',
                icon: dto.icon || '',
                is_active: dto.published ?? true,
                order: dto.order || 0,
            })
                .select()
                .single();
            if (insertError) {
                this.logger.error('Error creating program:', insertError);
                throw insertError;
            }
            this.logger.log(`✅ Program created with ID: ${newProgram.id}`);
            if (dto.mediaIds && dto.mediaIds.length > 0) {
                await supabaseClient
                    .from('program_media_item')
                    .delete()
                    .eq('program_id', newProgram.id);
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
                            program_id: newProgram.id,
                            media_id: mediaId,
                            type: 'image',
                            url: url,
                            alt_text: `Program media item ${i + 1}`,
                            order: i,
                        });
                    }
                    else {
                        this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                    }
                }
                if (mediaAssociations.length > 0) {
                    const { error: mediaError } = await supabaseClient
                        .from('program_media_item')
                        .insert(mediaAssociations);
                    if (mediaError) {
                        this.logger.error('Error linking media to program:', mediaError);
                    }
                    else {
                        this.logger.log(`✅ Linked ${mediaAssociations.length} media items to program`);
                    }
                }
                else {
                    this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for program ${newProgram.id}`);
                }
            }
            return await this.getPrograms();
        }
        catch (error) {
            this.logger.error('Error in createProgram:', error);
            throw error;
        }
    }
    async updateProgram(id, dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Updating program with ID: ${id}`);
            const updateData = {};
            if (dto.title !== undefined)
                updateData.title = dto.title;
            if (dto.description !== undefined)
                updateData.description = dto.description;
            if (dto.icon !== undefined)
                updateData.icon = dto.icon;
            if (dto.published !== undefined)
                updateData.is_active = dto.published;
            if (dto.order !== undefined)
                updateData.order = dto.order;
            const { data: updatedProgram, error: updateError } = await supabaseClient
                .from('program_content')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (updateError) {
                this.logger.error('Error updating program:', updateError);
                throw updateError;
            }
            this.logger.log(`✅ Program updated with ID: ${updatedProgram.id}`);
            if (dto.mediaIds !== undefined) {
                await supabaseClient
                    .from('program_media_item')
                    .delete()
                    .eq('program_id', id);
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
                                program_id: id,
                                media_id: mediaId,
                                type: 'image',
                                url: url,
                                alt_text: `Program media item ${i + 1}`,
                                order: i,
                            });
                        }
                        else {
                            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                        }
                    }
                    if (mediaAssociations.length > 0) {
                        const { error: mediaError } = await supabaseClient
                            .from('program_media_item')
                            .insert(mediaAssociations);
                        if (mediaError) {
                            this.logger.error('Error updating media associations:', mediaError);
                        }
                        else {
                            this.logger.log(`✅ Updated media associations for program: ${id}`);
                        }
                    }
                    else {
                        this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for program ${id}`);
                    }
                }
            }
            return await this.getPrograms();
        }
        catch (error) {
            this.logger.error('Error in updateProgram:', error);
            throw error;
        }
    }
    async deleteProgram(id) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Deleting program with ID: ${id}`);
            const { error } = await supabaseClient
                .from('program_content')
                .delete()
                .eq('id', id);
            if (error) {
                this.logger.error('Error deleting program:', error);
                throw error;
            }
            this.logger.log(`✅ Program deleted with ID: ${id}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error in deleteProgram:', error);
            throw error;
        }
    }
};
exports.ProgramsService = ProgramsService;
exports.ProgramsService = ProgramsService = ProgramsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ProgramsService);
//# sourceMappingURL=programs.service.js.map