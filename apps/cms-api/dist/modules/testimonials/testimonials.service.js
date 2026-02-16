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
var TestimonialsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let TestimonialsService = TestimonialsService_1 = class TestimonialsService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(TestimonialsService_1.name);
    }
    async getTestimonials() {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                this.logger.warn('Supabase client not available, returning empty testimonials');
                return [];
            }
            const { data, error } = await supabaseClient
                .from('testimonials')
                .select('*')
                .filter('is_active', 'eq', true)
                .order('order');
            if (error) {
                this.logger.error('Error fetching testimonials:', error);
                return [];
            }
            const testimonialsWithMedia = await Promise.all(data.map(async (testimonial) => {
                const { data: testimonialMediaItems, error: mediaError } = await supabaseClient
                    .from('testimonial_media_item')
                    .select('id, type, url, alt_text, order, created_at, media_id')
                    .eq('testimonial_id', testimonial.id)
                    .order('order');
                if (!mediaError && testimonialMediaItems) {
                    const filteredMediaItems = [];
                    for (const item of testimonialMediaItems) {
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
                                    createdAt: item.created_at || testimonial.created_at,
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
                                    createdAt: item.created_at || testimonial.created_at,
                                });
                            }
                            else {
                                this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
                            }
                        }
                    }
                    this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for testimonial ${testimonial.id}`);
                    return { ...testimonial, mediaItems: filteredMediaItems };
                }
                return testimonial;
            }));
            return testimonialsWithMedia;
        }
        catch (error) {
            this.logger.error('Unexpected error fetching testimonials:', error);
            return [];
        }
    }
    async createTestimonial(dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log('Creating new testimonial');
            const { data: newTestimonial, error: insertError } = await supabaseClient
                .from('testimonials')
                .insert({
                quote: dto.quote,
                author: dto.author,
                company: dto.company || '',
                is_active: dto.published ?? true,
                order: dto.order || 0,
            })
                .select()
                .single();
            if (insertError) {
                this.logger.error('Error creating testimonial:', insertError);
                throw insertError;
            }
            this.logger.log(`✅ Testimonial created with ID: ${newTestimonial.id}`);
            if (dto.mediaIds && dto.mediaIds.length > 0) {
                await supabaseClient
                    .from('testimonial_media_item')
                    .delete()
                    .eq('testimonial_id', newTestimonial.id);
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
                            testimonial_id: newTestimonial.id,
                            media_id: mediaId,
                            type: 'image',
                            url: url,
                            alt_text: `Testimonial media item ${i + 1}`,
                            order: i,
                        });
                    }
                    else {
                        this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                    }
                }
                if (mediaAssociations.length > 0) {
                    const { error: mediaError } = await supabaseClient
                        .from('testimonial_media_item')
                        .insert(mediaAssociations);
                    if (mediaError) {
                        this.logger.error('Error linking media to testimonial:', mediaError);
                    }
                    else {
                        this.logger.log(`✅ Linked ${mediaAssociations.length} media items to testimonial`);
                    }
                }
                else {
                    this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for testimonial ${newTestimonial.id}`);
                }
            }
            return await this.getTestimonials();
        }
        catch (error) {
            this.logger.error('Error in createTestimonial:', error);
            throw error;
        }
    }
    async updateTestimonial(id, dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Updating testimonial with ID: ${id}`);
            const updateData = {};
            if (dto.quote !== undefined)
                updateData.quote = dto.quote;
            if (dto.author !== undefined)
                updateData.author = dto.author;
            if (dto.company !== undefined)
                updateData.company = dto.company;
            if (dto.published !== undefined)
                updateData.is_active = dto.published;
            if (dto.order !== undefined)
                updateData.order = dto.order;
            const { data: updatedTestimonial, error: updateError } = await supabaseClient
                .from('testimonials')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (updateError) {
                this.logger.error('Error updating testimonial:', updateError);
                throw updateError;
            }
            this.logger.log(`✅ Testimonial updated with ID: ${updatedTestimonial.id}`);
            if (dto.mediaIds !== undefined) {
                await supabaseClient
                    .from('testimonial_media_item')
                    .delete()
                    .eq('testimonial_id', id);
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
                                testimonial_id: id,
                                media_id: mediaId,
                                type: 'image',
                                url: url,
                                alt_text: `Testimonial media item ${i + 1}`,
                                order: i,
                            });
                        }
                        else {
                            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                        }
                    }
                    if (mediaAssociations.length > 0) {
                        const { error: mediaError } = await supabaseClient
                            .from('testimonial_media_item')
                            .insert(mediaAssociations);
                        if (mediaError) {
                            this.logger.error('Error updating media associations:', mediaError);
                        }
                        else {
                            this.logger.log(`✅ Updated media associations for testimonial: ${id}`);
                        }
                    }
                    else {
                        this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for testimonial ${id}`);
                    }
                }
            }
            return await this.getTestimonials();
        }
        catch (error) {
            this.logger.error('Error in updateTestimonial:', error);
            throw error;
        }
    }
    async deleteTestimonial(id) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Deleting testimonial with ID: ${id}`);
            const { error } = await supabaseClient
                .from('testimonials')
                .delete()
                .eq('id', id);
            if (error) {
                this.logger.error('Error deleting testimonial:', error);
                throw error;
            }
            this.logger.log(`✅ Testimonial deleted with ID: ${id}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error in deleteTestimonial:', error);
            throw error;
        }
    }
};
exports.TestimonialsService = TestimonialsService;
exports.TestimonialsService = TestimonialsService = TestimonialsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], TestimonialsService);
//# sourceMappingURL=testimonials.service.js.map