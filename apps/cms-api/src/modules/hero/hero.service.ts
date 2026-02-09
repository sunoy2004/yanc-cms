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
        const { data: mediaItems, error: mediaError } = await supabaseClient
          .from('hero_media_item')
          .select('id, type, url, alt_text, order')
          .filter('hero_id', 'eq', data.id)
          .order('order');

        if (!mediaError) {
          // Transform to match expected frontend format
          const transformedMediaItems = mediaItems.map(item => ({
            id: item.id,
            type: item.type === 'image' ? 'image' : 'video',
            url: item.url,
            alt: item.alt_text,
            order: item.order,
            createdAt: data.created_at, // Use hero content created_at as media created_at
          }));
          return { ...data, mediaItems: transformedMediaItems };
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

        // Then create new associations - using the actual schema structure
        const mediaAssociations = dto.mediaIds.map((mediaId, index) => ({
          hero_id: newHero.id,
          type: 'image', // Default type - you might want to determine this from the media item
          url: `https://drive.google.com/file/d/${mediaId}/view`, // Construct URL from media ID
          alt_text: `Hero media item ${index + 1}`,
          order: index,
        }));

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
          const mediaAssociations = dto.mediaIds.map((mediaId, index) => ({
            hero_id: id,
            type: 'image', // Default type - you might want to determine this from the media item
            url: `https://drive.google.com/file/d/${mediaId}/view`, // Construct URL from media ID
            alt_text: `Hero media item ${index + 1}`,
            order: index,
          }));

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