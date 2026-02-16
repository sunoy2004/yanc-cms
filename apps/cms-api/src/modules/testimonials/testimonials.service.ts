import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateTestimonialDto } from '../../dtos/testimonial.dto';
import { UpdateTestimonialDto } from '../../dtos/testimonial-update.dto';

@Injectable()
export class TestimonialsService {
  private readonly logger = new Logger(TestimonialsService.name);

  constructor(private supabase: SupabaseService) {}

  async getTestimonials() {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        this.logger.warn('Supabase client not available, returning empty testimonials');
        return [];
      }

      const { data, error } = await supabaseClient
        .from('testimonials')
        .select('*')
        .filter('is_active', 'eq', true)
        .order('order');

      if (error) {
        this.logger.error('Error fetching testimonials:', error);
        return [];
      }

      // Fetch associated media items for each testimonial
      const testimonialsWithMedia = await Promise.all(
        data.map(async (testimonial) => {
          const { data: testimonialMediaItems, error: mediaError } = await supabaseClient
            .from('testimonial_media_item')
            .select('id, type, url, alt_text, order, created_at, media_id')
            .eq('testimonial_id', testimonial.id)
            .order('order');

          if (!mediaError && testimonialMediaItems) {
            // Transform to match expected frontend format
            const filteredMediaItems = [];

            for (const item of testimonialMediaItems) {
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
                    createdAt: item.created_at || testimonial.created_at,
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
                    createdAt: item.created_at || testimonial.created_at,
                  });
                } else {
                  this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
                }
              }
            }

            this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for testimonial ${testimonial.id}`);
            return { ...testimonial, mediaItems: filteredMediaItems };
          }

          return testimonial;
        })
      );

      return testimonialsWithMedia;
    } catch (error) {
      this.logger.error('Unexpected error fetching testimonials:', error);
      return [];
    }
  }

  async createTestimonial(dto: CreateTestimonialDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log('Creating new testimonial');

      // Insert the new testimonial
      const { data: newTestimonial, error: insertError } = await supabaseClient
        .from('testimonials')
        .insert({
          quote: dto.quote,
          author: dto.author,
          company: dto.company || '',
          is_active: dto.published ?? true,
          order: dto.order || 0,
        })
        .select()
        .single();

      if (insertError) {
        this.logger.error('Error creating testimonial:', insertError);
        throw insertError;
      }

      this.logger.log(`✅ Testimonial created with ID: ${newTestimonial.id}`);

      // If media IDs were provided, link them to the testimonial
      if (dto.mediaIds && dto.mediaIds.length > 0) {
        // First, remove any existing media associations for this testimonial
        await supabaseClient
          .from('testimonial_media_item')
          .delete()
          .eq('testimonial_id', newTestimonial.id);

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
              testimonial_id: newTestimonial.id,
              media_id: mediaId, // Use actual media_id instead of storing URL
              type: 'image',
              url: url, // Store the Supabase URL
              alt_text: `Testimonial media item ${i + 1}`,
              order: i,
            });
          } else {
            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
          }
        }

        if (mediaAssociations.length > 0) {
          const { error: mediaError } = await supabaseClient
            .from('testimonial_media_item')
            .insert(mediaAssociations);

          if (mediaError) {
            this.logger.error('Error linking media to testimonial:', mediaError);
            // Don't throw error here as the main testimonial was created successfully
          } else {
            this.logger.log(`✅ Linked ${mediaAssociations.length} media items to testimonial`);
          }
        } else {
          this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for testimonial ${newTestimonial.id}`);
        }
      }

      // Fetch and return the complete testimonial with media
      return await this.getTestimonials();
    } catch (error) {
      this.logger.error('Error in createTestimonial:', error);
      throw error;
    }
  }

  async updateTestimonial(id: string, dto: UpdateTestimonialDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Updating testimonial with ID: ${id}`);

      // Prepare update data with proper field mapping
      const updateData: any = {};
      if (dto.quote !== undefined) updateData.quote = dto.quote;
      if (dto.author !== undefined) updateData.author = dto.author;
      if (dto.company !== undefined) updateData.company = dto.company;
      if (dto.published !== undefined) updateData.is_active = dto.published;
      if (dto.order !== undefined) updateData.order = dto.order;

      // Update the testimonial
      const { data: updatedTestimonial, error: updateError } = await supabaseClient
        .from('testimonials')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        this.logger.error('Error updating testimonial:', updateError);
        throw updateError;
      }

      this.logger.log(`✅ Testimonial updated with ID: ${updatedTestimonial.id}`);

      // If media IDs were provided, update the media associations
      if (dto.mediaIds !== undefined) {
        // First, remove existing media associations for this testimonial
        await supabaseClient
          .from('testimonial_media_item')
          .delete()
          .eq('testimonial_id', id);

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
                testimonial_id: id,
                media_id: mediaId, // Use actual media_id instead of storing URL
                type: 'image',
                url: url, // Store the Supabase URL
                alt_text: `Testimonial media item ${i + 1}`,
                order: i,
              });
            } else {
              this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
            }
          }

          if (mediaAssociations.length > 0) {
            const { error: mediaError } = await supabaseClient
              .from('testimonial_media_item')
              .insert(mediaAssociations);

            if (mediaError) {
              this.logger.error('Error updating media associations:', mediaError);
              // Don't throw error here as the main testimonial was updated successfully
            } else {
              this.logger.log(`✅ Updated media associations for testimonial: ${id}`);
            }
          } else {
            this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for testimonial ${id}`);
          }
        }
      }

      // Fetch and return the updated testimonials with media
      return await this.getTestimonials();
    } catch (error) {
      this.logger.error('Error in updateTestimonial:', error);
      throw error;
    }
  }

  async deleteTestimonial(id: string) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Deleting testimonial with ID: ${id}`);

      // Delete the testimonial (this will cascade delete media associations due to foreign key constraint)
      const { error } = await supabaseClient
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error deleting testimonial:', error);
        throw error;
      }

      this.logger.log(`✅ Testimonial deleted with ID: ${id}`);
      return true;
    } catch (error) {
      this.logger.error('Error in deleteTestimonial:', error);
      throw error;
    }
  }
}