import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateFounderDto } from '../../dtos/founder.dto';
import { UpdateFounderDto } from '../../dtos/founder-update.dto';

@Injectable()
export class FoundersService {
  private readonly logger = new Logger(FoundersService.name);

  constructor(private supabase: SupabaseService) {}

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

      // Fetch associated media items for each founder
      const foundersWithMedia = await Promise.all(
        data.map(async (founder) => {
          const { data: founderMediaItems, error: mediaError } = await supabaseClient
            .from('founder_media_item')
            .select('id, type, url, alt_text, order, created_at, media_id')
            .eq('founder_id', founder.id)
            .order('order');

          if (!mediaError && founderMediaItems) {
            // Transform to match expected frontend format
            const filteredMediaItems = [];

            for (const item of founderMediaItems) {
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
                    createdAt: item.created_at || founder.created_at,
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
                    createdAt: item.created_at || founder.created_at,
                  });
                } else {
                  this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
                }
              }
            }

            this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for founder ${founder.id}`);
            return { ...founder, mediaItems: filteredMediaItems };
          }

          return founder;
        })
      );

      return foundersWithMedia;
    } catch (error) {
      this.logger.error('Unexpected error fetching founders:', error);
      return [];
    }
  }

  async createFounder(dto: CreateFounderDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log('Creating new founder');

      // Insert the new founder
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

      // If media IDs were provided, link them to the founder
      if (dto.mediaIds && dto.mediaIds.length > 0) {
        // First, remove any existing media associations for this founder
        await supabaseClient
          .from('founder_media_item')
          .delete()
          .eq('founder_id', newFounder.id);

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
              founder_id: newFounder.id,
              media_id: mediaId, // Use actual media_id instead of storing URL
              type: 'image',
              url: url, // Store the Supabase URL
              alt_text: `Founder media item ${i + 1}`,
              order: i,
            });
          } else {
            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
          }
        }

        if (mediaAssociations.length > 0) {
          const { error: mediaError } = await supabaseClient
            .from('founder_media_item')
            .insert(mediaAssociations);

          if (mediaError) {
            this.logger.error('Error linking media to founder:', mediaError);
            // Don't throw error here as the main founder was created successfully
          } else {
            this.logger.log(`✅ Linked ${mediaAssociations.length} media items to founder`);
          }
        } else {
          this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for founder ${newFounder.id}`);
        }
      }

      // Fetch and return the complete founder with media
      return await this.getFounders();
    } catch (error) {
      this.logger.error('Error in createFounder:', error);
      throw error;
    }
  }

  async updateFounder(id: string, dto: UpdateFounderDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Updating founder with ID: ${id}`);

      // Prepare update data with proper field mapping
      const updateData: any = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.bio !== undefined) updateData.bio = dto.bio;
      if (dto.published !== undefined) updateData.is_active = dto.published;
      if (dto.order !== undefined) updateData.order = dto.order;

      // Update the founder
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

      // If media IDs were provided, update the media associations
      if (dto.mediaIds !== undefined) {
        // First, remove existing media associations for this founder
        await supabaseClient
          .from('founder_media_item')
          .delete()
          .eq('founder_id', id);

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
                founder_id: id,
                media_id: mediaId, // Use actual media_id instead of storing URL
                type: 'image',
                url: url, // Store the Supabase URL
                alt_text: `Founder media item ${i + 1}`,
                order: i,
              });
            } else {
              this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
            }
          }

          if (mediaAssociations.length > 0) {
            const { error: mediaError } = await supabaseClient
              .from('founder_media_item')
              .insert(mediaAssociations);

            if (mediaError) {
              this.logger.error('Error updating media associations:', mediaError);
              // Don't throw error here as the main founder was updated successfully
            } else {
              this.logger.log(`✅ Updated media associations for founder: ${id}`);
            }
          } else {
            this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for founder ${id}`);
          }
        }
      }

      // Fetch and return the updated founders with media
      return await this.getFounders();
    } catch (error) {
      this.logger.error('Error in updateFounder:', error);
      throw error;
    }
  }

  async deleteFounder(id: string) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Deleting founder with ID: ${id}`);

      // Delete the founder (this will cascade delete media associations due to foreign key constraint)
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
    } catch (error) {
      this.logger.error('Error in deleteFounder:', error);
      throw error;
    }
  }
}