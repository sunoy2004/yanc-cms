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
var EventGalleryItemsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventGalleryItemsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let EventGalleryItemsService = EventGalleryItemsService_1 = class EventGalleryItemsService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(EventGalleryItemsService_1.name);
    }
    async getEventGalleryItems() {
        try {
            this.logger.log('Retrieving all event gallery items');
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            const { data: galleryItems, error: itemsError } = await supabaseClient
                .from('event_gallery_items')
                .select(`
          *,
          event_gallery_item_media (
            media (*)
          )
        `)
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            if (itemsError) {
                this.logger.error('Error retrieving event gallery items:', itemsError);
                throw itemsError;
            }
            this.logger.log(`✅ Retrieved ${galleryItems.length} event gallery items`);
            return galleryItems.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                media: item.event_gallery_item_media?.map(mediaItem => ({
                    id: mediaItem.media.id,
                    url: mediaItem.media.storage_path ?
                        `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaItem.media.storage_path}` :
                        null,
                    type: mediaItem.media.mime_type?.startsWith('image/') ? 'image' : 'video',
                    alt: item.title || 'Event gallery item'
                })).filter(media => media.url) || [],
                isActive: item.is_active,
                displayOrder: item.display_order,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            })).filter(item => item.media.length > 0);
        }
        catch (error) {
            this.logger.error('Error in getEventGalleryItems:', error);
            throw error;
        }
    }
    async createEventGalleryItem(dto) {
        try {
            this.logger.log('Creating new event gallery item');
            this.logger.log('Received DTO:', JSON.stringify(dto, null, 2));
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            const { mediaIds, ...galleryItemData } = dto;
            this.logger.log('Extracted mediaIds:', mediaIds);
            this.logger.log('Gallery item data to insert:', JSON.stringify(galleryItemData, null, 2));
            const insertData = {
                title: galleryItemData.title,
                description: galleryItemData.description,
                is_active: galleryItemData.isActive ?? true,
                display_order: galleryItemData.displayOrder ?? 0
            };
            this.logger.log('Final insert data:', JSON.stringify(insertData, null, 2));
            const { data: galleryItem, error: itemError } = await supabaseClient
                .from('event_gallery_items')
                .insert([insertData])
                .select()
                .single();
            if (itemError) {
                this.logger.error('Error creating event gallery item:', itemError);
                this.logger.error('Error details:', JSON.stringify(itemError, null, 2));
                throw itemError;
            }
            this.logger.log('Created gallery item:', galleryItem);
            if (mediaIds && mediaIds.length > 0) {
                const mediaEntries = mediaIds.map((mediaId, index) => ({
                    event_gallery_item_id: galleryItem.id,
                    media_id: mediaId,
                    display_order: index
                }));
                this.logger.log('Creating media associations:', JSON.stringify(mediaEntries, null, 2));
                const { error: mediaError } = await supabaseClient
                    .from('event_gallery_item_media')
                    .insert(mediaEntries);
                if (mediaError) {
                    this.logger.error('Error creating gallery media associations:', mediaError);
                    this.logger.error('Media error details:', JSON.stringify(mediaError, null, 2));
                }
                else {
                    this.logger.log(`✅ Created ${mediaEntries.length} media associations for gallery item`);
                }
            }
            this.logger.log(`✅ Created event gallery item with ID: ${galleryItem.id}`);
            return await this.getEventGalleryItems();
        }
        catch (error) {
            this.logger.error('Error in createEventGalleryItem:', error);
            this.logger.error('Full error stack:', error.stack);
            throw error;
        }
    }
    async updateEventGalleryItem(id, dto) {
        try {
            this.logger.log(`Updating event gallery item: ${id}`);
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            const { mediaIds, ...updateFields } = dto;
            const updateData = {};
            if (updateFields.title !== undefined)
                updateData.title = updateFields.title;
            if (updateFields.description !== undefined)
                updateData.description = updateFields.description;
            if (updateFields.isActive !== undefined)
                updateData.is_active = updateFields.isActive;
            if (updateFields.displayOrder !== undefined)
                updateData.display_order = updateFields.displayOrder;
            if (Object.keys(updateData).length > 0) {
                const { data, error } = await supabaseClient
                    .from('event_gallery_items')
                    .update(updateData)
                    .eq('id', id)
                    .select()
                    .single();
                if (error) {
                    this.logger.error('Error updating event gallery item:', error);
                    throw error;
                }
            }
            if (mediaIds !== undefined) {
                await supabaseClient
                    .from('event_gallery_item_media')
                    .delete()
                    .eq('event_gallery_item_id', id);
                if (mediaIds && mediaIds.length > 0) {
                    const mediaEntries = mediaIds.map((mediaId, index) => ({
                        event_gallery_item_id: id,
                        media_id: mediaId,
                        display_order: index
                    }));
                    const { error: mediaError } = await supabaseClient
                        .from('event_gallery_item_media')
                        .insert(mediaEntries);
                    if (mediaError) {
                        this.logger.error('Error updating gallery media associations:', mediaError);
                    }
                    else {
                        this.logger.log(`✅ Updated ${mediaEntries.length} media associations for gallery item`);
                    }
                }
            }
            this.logger.log(`✅ Updated event gallery item: ${id}`);
            return await this.getEventGalleryItems();
        }
        catch (error) {
            this.logger.error('Error in updateEventGalleryItem:', error);
            throw error;
        }
    }
    async deleteEventGalleryItem(id) {
        try {
            this.logger.log(`Deleting event gallery item: ${id}`);
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            const { error } = await supabaseClient
                .from('event_gallery_items')
                .delete()
                .eq('id', id);
            if (error) {
                this.logger.error('Error deleting event gallery item:', error);
                throw error;
            }
            this.logger.log(`✅ Deleted event gallery item: ${id}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error in deleteEventGalleryItem:', error);
            throw error;
        }
    }
    async togglePublish(id, isActive) {
        try {
            this.logger.log(`Toggling publish status for event gallery item: ${id}`);
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            const { data, error } = await supabaseClient
                .from('event_gallery_items')
                .update({ is_active: isActive })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                this.logger.error('Error toggling publish status:', error);
                throw error;
            }
            this.logger.log(`✅ Toggled publish status for event gallery item: ${id}`);
            return await this.getEventGalleryItems();
        }
        catch (error) {
            this.logger.error('Error in togglePublish:', error);
            throw error;
        }
    }
};
exports.EventGalleryItemsService = EventGalleryItemsService;
exports.EventGalleryItemsService = EventGalleryItemsService = EventGalleryItemsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], EventGalleryItemsService);
//# sourceMappingURL=event-gallery-items.service.js.map