import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateMentorTalkDto } from '../../dtos/mentor-talk.dto';
import { UpdateMentorTalkDto } from '../../dtos/mentor-talk-update.dto';

@Injectable()
export class MentorTalksService {
  private readonly logger = new Logger(MentorTalksService.name);

  constructor(private supabase: SupabaseService) {}

  async getMentorTalks() {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        this.logger.warn('Supabase client not available, returning empty mentor talks');
        return [];
      }

      const { data, error } = await supabaseClient
        .from('mentor_talks')
        .select(`
          *,
          mentor_talk_gallery_items (
            id,
            media_id,
            type,
            url,
            alt_text,
            display_order,
            created_at
          )
        `)
        .eq('is_active', true)
        .order('date', { ascending: false });

      if (error) {
        this.logger.error('Error fetching mentor talks:', error);
        return [];
      }

      // Process the data to match frontend expectations
      const processedTalks = await Promise.all(
        data.map(async (talk) => {
          // Process gallery items to get proper media URLs
          const processedGallery = [];
          
          if (talk.mentor_talk_gallery_items && talk.mentor_talk_gallery_items.length > 0) {
            for (const item of talk.mentor_talk_gallery_items) {
              // If media_id exists, get the actual media record for storage_path
              if (item.media_id) {
                const { data: mediaRecord, error: mediaError } = await supabaseClient
                  .from('media')
                  .select('storage_path')
                  .eq('id', item.media_id)
                  .single();

                if (!mediaError && mediaRecord && mediaRecord.storage_path) {
                  const supabaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaRecord.storage_path}`;
                  processedGallery.push({
                    id: item.id,
                    type: item.type,
                    url: supabaseUrl,
                    alt: item.alt_text,
                    order: item.display_order,
                    createdAt: item.created_at,
                  });
                } else {
                  this.logger.warn(`⚠️ Skipping gallery item ${item.id} - no storage path`);
                }
              } else if (item.url && item.url.includes('supabase.co/storage')) {
                // If it's already a Supabase URL, use it as-is
                processedGallery.push({
                  id: item.id,
                  type: item.type,
                  url: item.url,
                  alt: item.alt_text,
                  order: item.display_order,
                  createdAt: item.created_at,
                });
              } else {
                this.logger.warn(`⚠️ Filtering out gallery item ${item.id} - invalid URL`);
              }
            }
          }

          return {
            id: talk.id,
            title: talk.title,
            speaker: talk.speaker,
            speakerBio: talk.speaker_bio,
            date: talk.date,
            description: talk.description,
            content: talk.content,
            videoUrl: talk.video_url,
            thumbnail: talk.thumbnail_url,
            gallery: processedGallery.sort((a, b) => (a.order || 0) - (b.order || 0)),
            isPublished: talk.is_active,
            order: talk.order,
            createdAt: talk.created_at,
            updatedAt: talk.updated_at,
          };
        })
      );

      this.logger.log(`✅ Returning ${processedTalks.length} mentor talks`);
      
      // Log the dates before sorting for debugging
      this.logger.log('Dates before sorting:', processedTalks.map(talk => ({ title: talk.title, date: talk.date })));
      
      // Sort by date descending (most recent first) - create new array
      const sortedTalks = [...processedTalks].sort((a, b) => {
        // Handle null/undefined dates by treating them as very old dates
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        
        // Validate that dates are valid
        const isValidA = !isNaN(dateA.getTime());
        const isValidB = !isNaN(dateB.getTime());
        
        // If both dates are invalid, maintain original order
        if (!isValidA && !isValidB) return 0;
        
        // Invalid dates go to the end
        if (!isValidA) return 1;
        if (!isValidB) return -1;
        
        // Sort valid dates in descending order (most recent first)
        const result = dateB.getTime() - dateA.getTime();
        this.logger.log(`Comparing ${a.title} (${a.date}) with ${b.title} (${b.date}): ${result}`);
        return result;
      });
      
      // Log the dates after sorting for debugging
      this.logger.log('Dates after sorting:', sortedTalks.map(talk => ({ 
        title: talk.title, 
        date: talk.date,
        timestamp: talk.date ? new Date(talk.date).getTime() : 'INVALID'
      })));
      
      return sortedTalks;
    } catch (error) {
      this.logger.error('Unexpected error fetching mentor talks:', error);
      return [];
    }
  }

  async getAllMentorTalks() {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      const { data, error } = await supabaseClient
        .from('mentor_talks')
        .select(`
          *,
          mentor_talk_gallery_items (
            id,
            media_id,
            type,
            url,
            alt_text,
            display_order,
            created_at
          )
        `)
        .order('date', { ascending: false });

      if (error) {
        this.logger.error('Error fetching all mentor talks:', error);
        throw error;
      }

      // Process the data (same logic as getMentorTalks but without published filter)
      const processedTalks = await Promise.all(
        data.map(async (talk) => {
          const processedGallery = [];
          
          if (talk.mentor_talk_gallery_items && talk.mentor_talk_gallery_items.length > 0) {
            for (const item of talk.mentor_talk_gallery_items) {
              if (item.media_id) {
                const { data: mediaRecord, error: mediaError } = await supabaseClient
                  .from('media')
                  .select('storage_path')
                  .eq('id', item.media_id)
                  .single();

                if (!mediaError && mediaRecord && mediaRecord.storage_path) {
                  const supabaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaRecord.storage_path}`;
                  processedGallery.push({
                    id: item.id,
                    type: item.type,
                    url: supabaseUrl,
                    alt: item.alt_text,
                    order: item.display_order,
                    createdAt: item.created_at,
                  });
                }
              } else if (item.url && item.url.includes('supabase.co/storage')) {
                processedGallery.push({
                  id: item.id,
                  type: item.type,
                  url: item.url,
                  alt: item.alt_text,
                  order: item.display_order,
                  createdAt: item.created_at,
                });
              }
            }
          }

          return {
            id: talk.id,
            title: talk.title,
            speaker: talk.speaker,
            speakerBio: talk.speaker_bio,
            date: talk.date,
            description: talk.description,
            content: talk.content,
            videoUrl: talk.video_url,
            thumbnail: talk.thumbnail_url,
            gallery: processedGallery.sort((a, b) => (a.order || 0) - (b.order || 0)),
            isPublished: talk.is_active,
            order: talk.order,
            createdAt: talk.created_at,
            updatedAt: talk.updated_at,
          };
        })
      );

      return [...processedTalks].sort((a, b) => {
        // Handle null/undefined dates by treating them as very old dates
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        
        // Validate that dates are valid
        const isValidA = !isNaN(dateA.getTime());
        const isValidB = !isNaN(dateB.getTime());
        
        // If both dates are invalid, maintain original order
        if (!isValidA && !isValidB) return 0;
        
        // Invalid dates go to the end
        if (!isValidA) return 1;
        if (!isValidB) return -1;
        
        // Sort valid dates in descending order (most recent first)
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      this.logger.error('Error in getAllMentorTalks:', error);
      throw error;
    }
  }

  async createMentorTalk(dto: CreateMentorTalkDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log('Creating new mentor talk');

      // Insert the new mentor talk
      const { data: newTalk, error: insertError } = await supabaseClient
        .from('mentor_talks')
        .insert({
          title: dto.title,
          speaker: dto.speaker,
          speaker_bio: dto.speakerBio || '',
          date: dto.talkDate,
          description: dto.description || '',
          content: dto.content || '',
          video_url: dto.videoUrl || '',
          thumbnail_url: dto.thumbnailUrl || '',
          is_active: dto.published ?? true,
          "order": dto.order || 0,
        })
        .select()
        .single();

      if (insertError) {
        this.logger.error('Error creating mentor talk:', insertError);
        throw insertError;
      }

      this.logger.log(`✅ Mentor talk created with ID: ${newTalk.id}`);

      // Handle gallery items if provided
      if (dto.mediaIds && dto.mediaIds.length > 0) {
        await this.updateTalkGallery(supabaseClient, newTalk.id, dto.mediaIds);
      }

      // Return all mentor talks
      return await this.getAllMentorTalks();
    } catch (error) {
      this.logger.error('Error in createMentorTalk:', error);
      throw error;
    }
  }

  async updateMentorTalk(id: string, dto: UpdateMentorTalkDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Updating mentor talk with ID: ${id}`);

      // Prepare update data
      const updateData: any = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.speaker !== undefined) updateData.speaker = dto.speaker;
      if (dto.speakerBio !== undefined) updateData.speaker_bio = dto.speakerBio;
      if (dto.talkDate !== undefined) updateData.date = dto.talkDate;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.content !== undefined) updateData.content = dto.content;
      if (dto.videoUrl !== undefined) updateData.video_url = dto.videoUrl;
      if (dto.thumbnailUrl !== undefined) updateData.thumbnail_url = dto.thumbnailUrl;
      if (dto.published !== undefined) updateData.is_active = dto.published;
      if (dto.order !== undefined) updateData.order = dto.order;

      // Update the mentor talk
      const { data: updatedTalk, error: updateError } = await supabaseClient
        .from('mentor_talks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        this.logger.error('Error updating mentor talk:', updateError);
        throw updateError;
      }

      this.logger.log(`✅ Mentor talk updated with ID: ${updatedTalk.id}`);

      // Handle gallery items if provided
      if (dto.mediaIds !== undefined) {
        await this.updateTalkGallery(supabaseClient, id, dto.mediaIds);
      }

      // Return all mentor talks
      return await this.getAllMentorTalks();
    } catch (error) {
      this.logger.error('Error in updateMentorTalk:', error);
      throw error;
    }
  }

  async deleteMentorTalk(id: string) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Deleting mentor talk with ID: ${id}`);

      const { error } = await supabaseClient
        .from('mentor_talks')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error deleting mentor talk:', error);
        throw error;
      }

      this.logger.log(`✅ Mentor talk deleted with ID: ${id}`);
      return true;
    } catch (error) {
      this.logger.error('Error in deleteMentorTalk:', error);
      throw error;
    }
  }

  private async updateTalkGallery(supabaseClient: any, talkId: string, mediaIds: string[]) {
    try {
      // Remove existing gallery items
      await supabaseClient
        .from('mentor_talk_gallery_items')
        .delete()
        .eq('mentor_talk_id', talkId);

      // Add new gallery items
      if (mediaIds && mediaIds.length > 0) {
        const galleryItems = [];

        for (let i = 0; i < mediaIds.length; i++) {
          const mediaId = mediaIds[i];
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
            galleryItems.push({
              mentor_talk_id: talkId,
              media_id: mediaId,
              type: 'image',
              url: url,
              alt_text: `Gallery item ${i + 1}`,
              display_order: i,
            });
          }
        }

        if (galleryItems.length > 0) {
          const { error: galleryError } = await supabaseClient
            .from('mentor_talk_gallery_items')
            .insert(galleryItems);

          if (galleryError) {
            this.logger.error('Error inserting gallery items:', galleryError);
          } else {
            this.logger.log(`✅ Added ${galleryItems.length} gallery items to talk ${talkId}`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error updating talk gallery:', error);
    }
  }
}