import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateProgramDto } from '../../dtos/program.dto';
import { UpdateProgramDto } from '../../dtos/program-update.dto';

@Injectable()
export class ProgramsService {
  private readonly logger = new Logger(ProgramsService.name);

  constructor(private supabase: SupabaseService) {}

  async getPrograms() {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        this.logger.warn('Supabase client not available, returning empty programs');
        return [];
      }

      const { data, error } = await supabaseClient
        .from('program_content')
        .select('*')
        .filter('is_active', 'eq', true)
        .order('order');

      if (error) {
        this.logger.error('Error fetching programs:', error);
        return [];
      }

      // Fetch associated media items for each program
      const programsWithMedia = await Promise.all(
        data.map(async (program) => {
          const { data: programMediaItems, error: mediaError } = await supabaseClient
            .from('program_media_item')
            .select('id, type, url, alt_text, order, created_at, media_id')
            .eq('program_id', program.id)
            .order('order');

          if (!mediaError && programMediaItems) {
            // Transform to match expected frontend format
            const filteredMediaItems = [];

            for (const item of programMediaItems) {
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
                    createdAt: item.created_at || program.created_at,
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
                    createdAt: item.created_at || program.created_at,
                  });
                } else {
                  this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
                }
              }
            }

            this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for program ${program.id}`);
            return { ...program, mediaItems: filteredMediaItems };
          }

          return program;
        })
      );

      return programsWithMedia;
    } catch (error) {
      this.logger.error('Unexpected error fetching programs:', error);
      return [];
    }
  }

  async createProgram(dto: CreateProgramDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log('Creating new program');

      // Insert the new program
      const { data: newProgram, error: insertError } = await supabaseClient
        .from('program_content')
        .insert({
          title: dto.title,
          description: dto.description || '',
          icon: dto.icon || '',
          is_active: dto.published ?? true,
          order: dto.order || 0,
        })
        .select()
        .single();

      if (insertError) {
        this.logger.error('Error creating program:', insertError);
        throw insertError;
      }

      this.logger.log(`✅ Program created with ID: ${newProgram.id}`);

      // If media IDs were provided, link them to the program
      if (dto.mediaIds && dto.mediaIds.length > 0) {
        // First, remove any existing media associations for this program
        await supabaseClient
          .from('program_media_item')
          .delete()
          .eq('program_id', newProgram.id);

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
              program_id: newProgram.id,
              media_id: mediaId, // Use actual media_id instead of storing URL
              type: 'image',
              url: url, // Store the Supabase URL
              alt_text: `Program media item ${i + 1}`,
              order: i,
            });
          } else {
            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
          }
        }

        if (mediaAssociations.length > 0) {
          const { error: mediaError } = await supabaseClient
            .from('program_media_item')
            .insert(mediaAssociations);

          if (mediaError) {
            this.logger.error('Error linking media to program:', mediaError);
            // Don't throw error here as the main program was created successfully
          } else {
            this.logger.log(`✅ Linked ${mediaAssociations.length} media items to program`);
          }
        } else {
          this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for program ${newProgram.id}`);
        }
      }

      // Fetch and return the complete program with media
      return await this.getPrograms();
    } catch (error) {
      this.logger.error('Error in createProgram:', error);
      throw error;
    }
  }

  async updateProgram(id: string, dto: UpdateProgramDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Updating program with ID: ${id}`);

      // Prepare update data with proper field mapping
      const updateData: any = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.icon !== undefined) updateData.icon = dto.icon;
      if (dto.published !== undefined) updateData.is_active = dto.published;
      if (dto.order !== undefined) updateData.order = dto.order;

      // Update the program
      const { data: updatedProgram, error: updateError } = await supabaseClient
        .from('program_content')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        this.logger.error('Error updating program:', updateError);
        throw updateError;
      }

      this.logger.log(`✅ Program updated with ID: ${updatedProgram.id}`);

      // If media IDs were provided, update the media associations
      if (dto.mediaIds !== undefined) {
        // First, remove existing media associations for this program
        await supabaseClient
          .from('program_media_item')
          .delete()
          .eq('program_id', id);

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
                program_id: id,
                media_id: mediaId, // Use actual media_id instead of storing URL
                type: 'image',
                url: url, // Store the Supabase URL
                alt_text: `Program media item ${i + 1}`,
                order: i,
              });
            } else {
              this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
            }
          }

          if (mediaAssociations.length > 0) {
            const { error: mediaError } = await supabaseClient
              .from('program_media_item')
              .insert(mediaAssociations);

            if (mediaError) {
              this.logger.error('Error updating media associations:', mediaError);
              // Don't throw error here as the main program was updated successfully
            } else {
              this.logger.log(`✅ Updated media associations for program: ${id}`);
            }
          } else {
            this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for program ${id}`);
          }
        }
      }

      // Fetch and return the updated programs with media
      return await this.getPrograms();
    } catch (error) {
      this.logger.error('Error in updateProgram:', error);
      throw error;
    }
  }

  async deleteProgram(id: string) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Deleting program with ID: ${id}`);

      // Delete the program (this will cascade delete media associations due to foreign key constraint)
      const { error } = await supabaseClient
        .from('program_content')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error deleting program:', error);
        throw error;
      }

      this.logger.log(`✅ Program deleted with ID: ${id}`);
      return true;
    } catch (error) {
      this.logger.error('Error in deleteProgram:', error);
      throw error;
    }
  }
}