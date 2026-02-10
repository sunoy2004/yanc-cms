import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateHeroDto } from '../../dtos/hero.dto';
import { UpdateHeroDto } from '../../dtos/hero-update.dto';

@Injectable()
export class HeroService {
  private readonly logger = new Logger(HeroService.name);

  constructor(private supabase: SupabaseService) {}

  async getHeroContent() {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        this.logger.warn('Supabase client not available, returning empty hero content');
        return null;
      }

      const { data, error } = await supabaseClient
        .from('hero_content')
        .select('*')
        .filter('is_active', 'eq', true)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          this.logger.log('No active hero content found');
          return null;
        }
        this.logger.error('Error fetching hero content:', error);
        return null;
      }

      // Fetch associated media items if they exist
      if (data && data.id) {
        const { data: heroMediaItems, error: mediaError } = await supabaseClient
          .from('hero_media_item')
          .select('id, type, url, alt_text, order, created_at, media_id')
          .eq('hero_id', data.id)
          .order('order');

        if (!mediaError && heroMediaItems) {
          // Transform to match expected frontend format
          // ONLY include items with Supabase Storage URLs (prevent Drive URL leakage)
          const filteredMediaItems = [];
          
          for (const item of heroMediaItems) {
            // If the media_id is present, fetch the media record to check for storage_path
            if (item.media_id) {
              const { data: mediaRecord, error: mediaRecordError } = await supabaseClient
                .from('media')
                .select('storage_path')
                .eq('id', item.media_id)
                .single();
              
              if (!mediaRecordError && mediaRecord && mediaRecord.storage_path) {
                // Use the Supabase Storage URL instead of the stored URL
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
                // If media exists but doesn't have storage_path, check if the stored URL is a Supabase URL
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
                  this.logger.warn(`⚠️ Filtering out media item ${item.id} due to non-Supabase URL, preventing Drive URL leakage`);
                }
              }
            } else {
              // If no media_id, just check if the stored URL is a Supabase URL
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
                this.logger.warn(`⚠️ Filtering out media item ${item.id} due to non-Supabase URL, preventing Drive URL leakage`);
              }
            }
          }
          
          this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for hero ${data.id}`);
          return { ...data, mediaItems: filteredMediaItems };
        }
      }

      return data;
    } catch (error) {
      this.logger.error('Unexpected error fetching hero content:', error);
      return null;
    }
  }

  async createHeroContent(dto: CreateHeroDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log('Creating new hero content');

      // First, deactivate all existing active hero content
      const { error: updateError } = await supabaseClient
        .from('hero_content')
        .update({ is_active: false })
        .eq('is_active', true);

      if (updateError) {
        this.logger.error('Error deactivating existing hero content:', updateError);
        throw updateError;
      }

      // Insert the new hero content
      const { data: newHero, error: insertError } = await supabaseClient
        .from('hero_content')
        .insert({
          title: dto.title,
          subtitle: dto.subtitle || '',
          cta_text: dto.ctaText || '',
          cta_url: dto.ctaLink || '',
          is_active: dto.published ?? true,
        })
        .select()
        .single();

      if (insertError) {
        this.logger.error('Error creating hero content:', insertError);
        throw insertError;
      }

      this.logger.log(`✅ Hero content created with ID: ${newHero.id}`);

      // If media IDs were provided, link them to the hero
      if (dto.mediaIds && dto.mediaIds.length > 0) {
        // First, remove any existing media associations for this hero
        await supabaseClient
          .from('hero_media_item')
          .delete()
          .eq('hero_id', newHero.id);

        // Then create new associations - get media items to get their Supabase Storage URLs
        // Only include media items that have Supabase Storage URLs (prevent Drive URL leakage)
        const mediaAssociations = [];
        
        for (let i = 0; i < dto.mediaIds.length; i++) {
          const mediaId = dto.mediaIds[i];
          const { data: mediaItem, error: mediaError } = await supabaseClient
            .from('media')
            .select('storage_path, drive_id, storage_type')
            .eq('id', mediaId)
            .single();
          
          if (mediaError) {
            this.logger.error(`Error fetching media item ${mediaId}:`, mediaError);
            continue; // Skip this media item
          }
          
          // ONLY create association if media has Supabase Storage URL (prevent Drive URL leakage)
          if (mediaItem.storage_path) {
            const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaItem.storage_path}`;
            mediaAssociations.push({
              hero_id: newHero.id,
              media_id: mediaId, // Use actual media_id instead of storing URL
              type: 'image',
              url: url, // Store the Supabase URL
              alt_text: `Hero media item ${i + 1}`,
              order: i,
            });
          } else {
            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association to prevent Drive URL leakage`);
          }
        }

        if (mediaAssociations.length > 0) {
          const { error: mediaError } = await supabaseClient
            .from('hero_media_item')
            .insert(mediaAssociations);

          if (mediaError) {
            this.logger.error('Error linking media to hero:', mediaError);
            // Don't throw error here as the main hero content was created successfully
          } else {
            this.logger.log(`✅ Linked ${mediaAssociations.length} media items to hero`);
          }
        } else {
          this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for hero ${newHero.id}`);
        }
      }

      // Fetch and return the complete hero content with media
      return await this.getHeroContent();
    } catch (error) {
      this.logger.error('Error in createHeroContent:', error);
      throw error;
    }
  }

  async updateHeroContent(id: string, dto: UpdateHeroDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Updating hero content with ID: ${id}`);

      // If updating the published status, handle deactivation of other active content appropriately
      if (dto.published !== undefined && dto.published === true) {
        // Deactivate all other active hero content
        const { error: updateError } = await supabaseClient
          .from('hero_content')
          .update({ is_active: false })
          .neq('id', id)  // Don't deactivate the one we're updating
          .eq('is_active', true);

        if (updateError) {
          this.logger.error('Error deactivating other hero content:', updateError);
          throw updateError;
        }
      }

      // Prepare update data with proper field mapping
      const updateData: any = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.subtitle !== undefined) updateData.subtitle = dto.subtitle;
      if (dto.ctaText !== undefined) updateData.cta_text = dto.ctaText;
      if (dto.ctaLink !== undefined) updateData.cta_url = dto.ctaLink;
      if (dto.published !== undefined) updateData.is_active = dto.published;

      // Update the hero content
      const { data: updatedHero, error: updateError } = await supabaseClient
        .from('hero_content')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        this.logger.error('Error updating hero content:', updateError);
        throw updateError;
      }

      this.logger.log(`✅ Hero content updated with ID: ${updatedHero.id}`);

      // If media IDs were provided, update the media associations
      if (dto.mediaIds !== undefined) {
        // First, remove existing media associations for this hero
        await supabaseClient
          .from('hero_media_item')
          .delete()
          .eq('hero_id', id);

        // Then create new associations if media IDs were provided
        if (dto.mediaIds && dto.mediaIds.length > 0) {
          // Only include media items that have Supabase Storage URLs (prevent Drive URL leakage)
          const mediaAssociations = [];
          
          for (let i = 0; i < dto.mediaIds.length; i++) {
            const mediaId = dto.mediaIds[i];
            const { data: mediaItem, error: mediaError } = await supabaseClient
              .from('media')
              .select('storage_path, drive_id, storage_type')
              .eq('id', mediaId)
              .single();
            
            if (mediaError) {
              this.logger.error(`Error fetching media item ${mediaId}:`, mediaError);
              continue; // Skip this media item
            }
            
            // ONLY create association if media has Supabase Storage URL (prevent Drive URL leakage)
            if (mediaItem.storage_path) {
              const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaItem.storage_path}`;
              mediaAssociations.push({
                hero_id: id,
                media_id: mediaId, // Use actual media_id instead of storing URL
                type: 'image',
                url: url, // Store the Supabase URL
                alt_text: `Hero media item ${i + 1}`,
                order: i,
              });
            } else {
              this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association to prevent Drive URL leakage`);
            }
          }

          if (mediaAssociations.length > 0) {
            const { error: mediaError } = await supabaseClient
              .from('hero_media_item')
              .insert(mediaAssociations);

            if (mediaError) {
              this.logger.error('Error updating media associations:', mediaError);
              // Don't throw error here as the main hero content was updated successfully
            } else {
              this.logger.log(`✅ Updated media associations for hero: ${id}`);
            }
          } else {
            this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for hero ${id}`);
          }
        }
      }

      // Fetch and return the updated hero content with media
      return await this.getHeroContent();
    } catch (error) {
      this.logger.error('Error in updateHeroContent:', error);
      throw error;
    }
  }
}