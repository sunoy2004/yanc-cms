import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateEventDto } from '../../dtos/event.dto';
import { UpdateEventDto } from '../../dtos/event-update.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private supabase: SupabaseService) {}

  async getEvents() {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        this.logger.warn('Supabase client not available, returning empty events');
        return [];
      }

      // Get all events with their highlights
      const { data, error } = await supabaseClient
        .from('event_content')
        .select(`
          *,
          event_highlights!event_id(id, content, display_order),
          event_gallery!event_id(id, media_id)
        `)
        .order('event_date', { ascending: false })
        .order('display_order', { ascending: true });

      if (error) {
        this.logger.error('Error fetching events:', error);
        return [];
      }

      // Process the events to organize highlights properly
      const eventsWithHighlights = data.map(event => {
        // Extract highlights from the joined data and sort by display_order
        const highlights = (event.event_highlights || [])
          .sort((a, b) => a.display_order - b.display_order)
          .map(h => h.content);
        
        // Extract gallery media IDs
        const galleryMediaIds = (event.event_gallery || []).map(g => g.media_id);
        
        // Remove the joined properties from the event object
        const { event_highlights, event_gallery, ...eventWithoutJoins } = event;
        
        return {
          ...eventWithoutJoins,
          highlights: highlights,
          galleryMediaIds: galleryMediaIds
        };
      });

      // Fetch associated media items for each event
      const eventsWithMedia = await Promise.all(
        eventsWithHighlights.map(async (event) => {
          if (event.galleryMediaIds && event.galleryMediaIds.length > 0) {
            const { data: eventMediaItems, error: mediaError } = await supabaseClient
              .from('media')
              .select('id, name, storage_path, storage_type, mime_type, created_at')
              .in('id', event.galleryMediaIds);

            if (!mediaError && eventMediaItems) {
              // Transform to match expected frontend format
              const mediaItems = eventMediaItems.map(media => {
                if (media.storage_path) {
                  // Use the Supabase Storage URL
                  const supabaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${media.storage_path}`;
                  return {
                    id: media.id,
                    name: media.name,
                    url: supabaseUrl,
                    type: media.mime_type.startsWith('image') ? 'image' : 'video',
                    alt: media.name,
                    order: event.galleryMediaIds.indexOf(media.id),
                    createdAt: media.created_at,
                  };
                } else {
                  return null;
                }
              }).filter(Boolean);

              return { ...event, mediaItems };
            }
          }

          return { ...event, mediaItems: [] };
        })
      );

      // Add computed fields for frontend
      const processedEvents = eventsWithMedia.map(event => ({
        ...event,
        // Fallback to 'upcoming' if category is undefined
        category: event.category || 'upcoming',
        isPast: new Date(event.event_date) < new Date(),
        isUpcoming: new Date(event.event_date) >= new Date(),
        year: new Date(event.event_date).getFullYear(),
        month: new Date(event.event_date).toLocaleString('default', { month: 'long' }),
      }));

      return processedEvents;
    } catch (error) {
      this.logger.error('Unexpected error fetching events:', error);
      return [];
    }
  }

  async createEvent(dto: CreateEventDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log('Creating new event');

      // Insert the new event
      const { data: newEvent, error: insertError } = await supabaseClient
        .from('event_content')
        .insert({
          title: dto.title,
          description: dto.description || '',
          speaker: dto.speaker || '',
          location: dto.location || '',
          event_date: dto.eventDate || new Date().toISOString(),
          category: dto.category,
          type: dto.category, // Also insert type for strict isolation
          is_active: dto.published ?? true,
          display_order: dto.displayOrder || 0,
        })
        .select()
        .single();

      if (insertError) {
        this.logger.error('Error creating event:', insertError);
        throw insertError;
      }

      this.logger.log(`✅ Event created with ID: ${newEvent.id}`);

      // If media IDs were provided, link them to the event via the event_gallery table
      if (dto.mediaIds && dto.mediaIds.length > 0) {
        // Create gallery entries
        const galleryEntries = dto.mediaIds.map((mediaId, index) => ({
          event_id: newEvent.id,
          media_id: mediaId,
          display_order: index,
        }));

        const { error: galleryError } = await supabaseClient
          .from('event_gallery')
          .insert(galleryEntries);

        if (galleryError) {
          this.logger.error('Error linking media to event:', galleryError);
          // Don't throw error here as the main event was created successfully
        } else {
          this.logger.log(`✅ Linked ${galleryEntries.length} media items to event`);
        }
      }

      // If highlights were provided, store them
      if (dto.highlights && dto.highlights.length > 0) {
        // Create highlight records
        const highlightRecords = dto.highlights
          .filter(highlight => highlight.trim() !== '') // Only store non-empty highlights
          .map((highlight, index) => ({
            event_id: newEvent.id,
            content: highlight.trim(),
            display_order: index,
          }));

        if (highlightRecords.length > 0) {
          const { error: highlightsError } = await supabaseClient
            .from('event_highlights')
            .insert(highlightRecords);

          if (highlightsError) {
            this.logger.error('Error creating event highlights:', highlightsError);
            // Don't throw error as the main event was created successfully
          } else {
            this.logger.log(`✅ Created ${highlightRecords.length} highlights for event`);
          }
        }
      }

      // Fetch and return the complete event with media
      return await this.getEvents();
    } catch (error) {
      this.logger.error('Error in createEvent:', error);
      throw error;
    }
  }

  async updateEvent(id: string, dto: UpdateEventDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Updating event with ID: ${id}`);

      // Prepare update data with proper field mapping
      const updateData: any = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.speaker !== undefined) updateData.speaker = dto.speaker;
      if (dto.location !== undefined) updateData.location = dto.location;
      if (dto.eventDate !== undefined) updateData.event_date = dto.eventDate;
      if (dto.category !== undefined) updateData.category = dto.category;
      if (dto.published !== undefined) updateData.is_active = dto.published;
      if (dto.displayOrder !== undefined) updateData.display_order = dto.displayOrder;

      // Update the event
      const { data: updatedEvent, error: updateError } = await supabaseClient
        .from('event_content')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        this.logger.error('Error updating event:', updateError);
        throw updateError;
      }

      this.logger.log(`✅ Event updated with ID: ${updatedEvent.id}`);

      // If media IDs were provided, update the gallery entries
      if (dto.mediaIds !== undefined) {
        // First, remove existing gallery entries for this event
        await supabaseClient
          .from('event_gallery')
          .delete()
          .eq('event_id', id);

        // Then create new gallery entries if media IDs were provided
        if (dto.mediaIds && dto.mediaIds.length > 0) {
          const galleryEntries = dto.mediaIds.map((mediaId, index) => ({
            event_id: id,
            media_id: mediaId,
            display_order: index,
          }));

          const { error: galleryError } = await supabaseClient
            .from('event_gallery')
            .insert(galleryEntries);

          if (galleryError) {
            this.logger.error('Error updating event gallery:', galleryError);
            // Don't throw error here as the main event was updated successfully
          } else {
            this.logger.log(`✅ Updated gallery for event: ${id}`);
          }
        }
      }

      // If highlights were provided, update them
      if (dto.highlights !== undefined) {
        // First, remove any existing highlights for this event
        await supabaseClient
          .from('event_highlights')
          .delete()
          .eq('event_id', id);

        // Then create new highlight records if provided
        if (dto.highlights && dto.highlights.length > 0) {
          const highlightRecords = dto.highlights
            .filter(highlight => highlight.trim() !== '') // Only store non-empty highlights
            .map((highlight, index) => ({
              event_id: id,
              content: highlight.trim(),
              display_order: index,
            }));

          if (highlightRecords.length > 0) {
            const { error: highlightsError } = await supabaseClient
              .from('event_highlights')
              .insert(highlightRecords);

            if (highlightsError) {
              this.logger.error('Error updating event highlights:', highlightsError);
              // Don't throw error as the main event was updated successfully
            } else {
              this.logger.log(`✅ Updated ${highlightRecords.length} highlights for event`);
            }
          }
        }
      }

      // Fetch and return the updated events with media
      return await this.getEvents();
    } catch (error) {
      this.logger.error('Error in updateEvent:', error);
      throw error;
    }
  }

  async deleteEvent(id: string) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Deleting event with ID: ${id}`);

      // Delete the event (this will cascade delete gallery and highlights due to foreign key constraints)
      const { error } = await supabaseClient
        .from('event_content')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error deleting event:', error);
        throw error;
      }

      this.logger.log(`✅ Event deleted with ID: ${id}`);
      return true;
    } catch (error) {
      this.logger.error('Error in deleteEvent:', error);
      throw error;
    }
  }
}