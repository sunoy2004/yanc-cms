import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateAboutDto } from '../../dtos/about.dto';
import { UpdateAboutDto } from '../../dtos/about-update.dto';

@Injectable()
export class AboutService {
  private readonly logger = new Logger(AboutService.name);

  constructor(private supabase: SupabaseService) {}

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
        if (error.code === 'PGRST116') { // No rows found
          this.logger.log('No active about content found');
          return null;
        }
        this.logger.error('Error fetching about content:', error);
        return null;
      }

      // Fetch associated media items if they exist
      if (data && data.id) {
        const { data: aboutMediaItems, error: mediaError } = await supabaseClient
          .from('about_us_media_item')
          .select('id, type, url, alt_text, order, created_at, media_id')
          .eq('about_us_id', data.id)
          .order('order');

        if (!mediaError && aboutMediaItems) {
          // Transform to match expected frontend format
          const filteredMediaItems = [];

          for (const item of aboutMediaItems) {
            // If the media_id is present, fetch the media record to get storage_path
            if (item.media_id) {
              const { data: mediaRecord, error: mediaRecordError } = await supabaseClient
                .from('media')
                .select('storage_path')
                .eq('id', item.media_id)
                .single();

              if (!mediaRecordError && mediaRecord && mediaRecord.storage_path) {
                // Use the Supabase Storage URL instead of any stored URL
                const supabaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaRecord.storage_path}`;
                filteredMediaItems.push({
                  id: item.id,
                  type: item.type === 'image' ? 'image' : 'video',
                  url: supabaseUrl,
                  alt: item.alt_text,
                  order: item.order,
                  createdAt: item.created_at || data.created_at,
                });
              } else {
                this.logger.warn(`⚠️ Filtering out media item ${item.id} - no storage path found`);
              }
            } else {
              // If no media_id, check if the stored URL is a Supabase URL (shouldn't happen with new system)
              if (item.url && item.url.includes('supabase.co/storage')) {
                filteredMediaItems.push({
                  id: item.id,
                  type: item.type === 'image' ? 'image' : 'video',
                  url: item.url,
                  alt: item.alt_text,
                  order: item.order,
                  createdAt: item.created_at || data.created_at,
                });
              } else {
                this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
              }
            }
          }

          this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for about ${data.id}`);
          return { ...data, mediaItems: filteredMediaItems };
        }
      }

      return data;
    } catch (error) {
      this.logger.error('Unexpected error fetching about content:', error);
      return null;
    }
  }

  async createAboutContent(dto: CreateAboutDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log('Creating new about content');

      // First, deactivate all existing active about content
      const { error: updateError } = await supabaseClient
        .from('about_us')
        .update({ is_active: false })
        .eq('is_active', true);

      if (updateError) {
        this.logger.error('Error deactivating existing about content:', updateError);
        throw updateError;
      }

      // Insert the new about content
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

      // If media IDs were provided, link them to the about content
      if (dto.mediaIds && dto.mediaIds.length > 0) {
        // First, remove any existing media associations for this about content
        await supabaseClient
          .from('about_us_media_item')
          .delete()
          .eq('about_us_id', newAbout.id);

        // Then create new associations - get media items to get their Supabase Storage URLs
        // Only include media items that have Supabase Storage URLs
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
            continue; // Skip this media item
          }

          // ONLY create association if media has Supabase Storage URL
          if (mediaItem.storage_path) {
            const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaItem.storage_path}`;
            mediaAssociations.push({
              about_us_id: newAbout.id,
              media_id: mediaId, // Use actual media_id instead of storing URL
              type: 'image',
              url: url, // Store the Supabase URL
              alt_text: `About content media item ${i + 1}`,
              order: i,
            });
          } else {
            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
          }
        }

        if (mediaAssociations.length > 0) {
          const { error: mediaError } = await supabaseClient
            .from('about_us_media_item')
            .insert(mediaAssociations);

          if (mediaError) {
            this.logger.error('Error linking media to about content:', mediaError);
            // Don't throw error here as the main about content was created successfully
          } else {
            this.logger.log(`✅ Linked ${mediaAssociations.length} media items to about content`);
          }
        } else {
          this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for about content ${newAbout.id}`);
        }
      }

      // Fetch and return the complete about content with media
      return await this.getAboutContent();
    } catch (error) {
      this.logger.error('Error in createAboutContent:', error);
      throw error;
    }
  }

  async updateAboutContent(id: string, dto: UpdateAboutDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Updating about content with ID: ${id}`);

      // If updating the published status, handle deactivation of other active content appropriately
      if (dto.published !== undefined && dto.published === true) {
        // Deactivate all other active about content
        const { error: updateError } = await supabaseClient
          .from('about_us')
          .update({ is_active: false })
          .neq('id', id)  // Don't deactivate the one we're updating
          .eq('is_active', true);

        if (updateError) {
          this.logger.error('Error deactivating other about content:', updateError);
          throw updateError;
        }
      }

      // Prepare update data with proper field mapping
      const updateData: any = {};
      if (dto.headline !== undefined) updateData.headline = dto.headline;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.visionTitle !== undefined) updateData.vision_title = dto.visionTitle;
      if (dto.visionDesc !== undefined) updateData.vision_desc = dto.visionDesc;
      if (dto.missionTitle !== undefined) updateData.mission_title = dto.missionTitle;
      if (dto.missionDesc !== undefined) updateData.mission_desc = dto.missionDesc;
      if (dto.published !== undefined) updateData.is_active = dto.published;

      // Update the about content
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

      // If media IDs were provided, update the media associations
      if (dto.mediaIds !== undefined) {
        // First, remove existing media associations for this about content
        await supabaseClient
          .from('about_us_media_item')
          .delete()
          .eq('about_us_id', id);

        // Then create new associations if media IDs were provided
        if (dto.mediaIds && dto.mediaIds.length > 0) {
          // Only include media items that have Supabase Storage URLs (prevent Drive URL leakage)
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
              continue; // Skip this media item
            }

            // ONLY create association if media has Supabase Storage URL
            if (mediaItem.storage_path) {
              const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaItem.storage_path}`;
              mediaAssociations.push({
                about_us_id: id,
                media_id: mediaId, // Use actual media_id instead of storing URL
                type: 'image',
                url: url, // Store the Supabase URL
                alt_text: `About content media item ${i + 1}`,
                order: i,
              });
            } else {
              this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
            }
          }

          if (mediaAssociations.length > 0) {
            const { error: mediaError } = await supabaseClient
              .from('about_us_media_item')
              .insert(mediaAssociations);

            if (mediaError) {
              this.logger.error('Error updating media associations:', mediaError);
              // Don't throw error here as the main about content was updated successfully
            } else {
              this.logger.log(`✅ Updated media associations for about content: ${id}`);
            }
          } else {
            this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for about content ${id}`);
          }
        }
      }

      // Fetch and return the updated about content with media
      return await this.getAboutContent();
    } catch (error) {
      this.logger.error('Error in updateAboutContent:', error);
      throw error;
    }
  }
}