import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateHeroDto } from '../../dtos/hero.dto';

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
        this.logger.error('Error fetching hero content:', error);
        return null;
      }

      // Fetch associated media items if they exist
      if (data && data.id) {
        const { data: mediaItems, error: mediaError } = await supabaseClient
          .from('hero_media_item')
          .select('*')
          .filter('hero_id', 'eq', data.id)
          .order('order');

        if (!mediaError) {
          return { ...data, mediaItems };
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

        // Then create new associations
        const mediaAssociations = dto.mediaIds.map((mediaId, index) => ({
          hero_id: newHero.id,
          media_id: mediaId,
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
}