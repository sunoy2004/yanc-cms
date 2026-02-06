import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

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
        .filter('isActive', 'eq', true)
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
          .filter('heroId', 'eq', data.id)
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
}