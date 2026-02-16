import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateEventGalleryItemDto } from '../../dtos/event-gallery-item.dto';
import { UpdateEventGalleryItemDto } from '../../dtos/event-gallery-item.dto';

@Injectable()
export class EventGalleryItemsService {
  private readonly logger = new Logger(EventGalleryItemsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async getEventGalleryItems() {
    try {
      this.logger.log('Retrieving all event gallery items');
      
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      // Get gallery items with their media information using junction table
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
      
      // Transform the data to match frontend expectations
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
        })).filter(media => media.url) || [], // Filter out invalid media URLs
        isActive: item.is_active,
        displayOrder: item.display_order,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })).filter(item => item.media.length > 0); // Only return items with valid media

    } catch (error) {
      this.logger.error('Error in getEventGalleryItems:', error);
      throw error;
    }
  }

  async createEventGalleryItem(dto: CreateEventGalleryItemDto) {
    try {
      this.logger.log('Creating new event gallery item');
      this.logger.log('Received DTO:', JSON.stringify(dto, null, 2));
      
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      // Extract mediaIds from DTO to avoid sending them to the main table
      const { mediaIds, ...galleryItemData } = dto;
      this.logger.log('Extracted mediaIds:', mediaIds);
      this.logger.log('Gallery item data to insert:', JSON.stringify(galleryItemData, null, 2));

      // Ensure we have the required fields with defaults
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

      // If media IDs were provided, create junction records
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
          // Don't throw error here as the main item was created successfully
        } else {
          this.logger.log(`✅ Created ${mediaEntries.length} media associations for gallery item`);
        }
      }

      this.logger.log(`✅ Created event gallery item with ID: ${galleryItem.id}`);
      return await this.getEventGalleryItems(); // Return all items for consistency
    } catch (error) {
      this.logger.error('Error in createEventGalleryItem:', error);
      this.logger.error('Full error stack:', error.stack);
      throw error;
    }
  }

  async updateEventGalleryItem(id: string, dto: UpdateEventGalleryItemDto) {
    try {
      this.logger.log(`Updating event gallery item: ${id}`);
      
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      // Extract mediaIds from DTO to avoid sending them to the main table
      const { mediaIds, ...updateFields } = dto;

      // Update the gallery item
      const updateData: any = {};
      if (updateFields.title !== undefined) updateData.title = updateFields.title;
      if (updateFields.description !== undefined) updateData.description = updateFields.description;
      if (updateFields.isActive !== undefined) updateData.is_active = updateFields.isActive;
      if (updateFields.displayOrder !== undefined) updateData.display_order = updateFields.displayOrder;

      // Only update if there are fields to update
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

      // If media IDs were provided, update the media associations
      if (mediaIds !== undefined) {
        // First, remove existing media associations
        await supabaseClient
          .from('event_gallery_item_media')
          .delete()
          .eq('event_gallery_item_id', id);

        // Then create new associations if provided
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
            // Don't throw error here as the main item was updated successfully
          } else {
            this.logger.log(`✅ Updated ${mediaEntries.length} media associations for gallery item`);
          }
        }
      }

      this.logger.log(`✅ Updated event gallery item: ${id}`);
      return await this.getEventGalleryItems();
    } catch (error) {
      this.logger.error('Error in updateEventGalleryItem:', error);
      throw error;
    }
  }

  async deleteEventGalleryItem(id: string) {
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
    } catch (error) {
      this.logger.error('Error in deleteEventGalleryItem:', error);
      throw error;
    }
  }

  async togglePublish(id: string, isActive: boolean) {
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
    } catch (error) {
      this.logger.error('Error in togglePublish:', error);
      throw error;
    }
  }
}