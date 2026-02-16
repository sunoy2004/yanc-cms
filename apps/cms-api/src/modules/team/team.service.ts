import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateTeamMemberDto } from '../../dtos/team.dto';
import { UpdateTeamMemberDto } from '../../dtos/team-update.dto';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(private supabase: SupabaseService) {}

  async getTeamMembers(section?: string) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        this.logger.warn('Supabase client not available, returning empty team members');
        return [];
      }
  
      // First, check if the section column exists by trying a simple query
      let useSectionFilter = false;
      if (section) {
        try {
          // Test if section column exists by doing a simple select
          const { error: testError } = await supabaseClient
            .from('team_members')
            .select('section')
            .limit(1);
          
          if (!testError) {
            useSectionFilter = true;
          }
        } catch (e) {
          this.logger.warn('Section column not found in team_members table');
        }
      }

      let query;
      if (useSectionFilter && section) {
        // Use section-based filtering
        query = supabaseClient
          .from('team_members')
          .select('*')
          .filter('is_active', 'eq', true)
          .eq('section', section);
      } else if (section) {
        // Fallback to old type-based filtering
        const typeMap: Record<string, string> = {
          'executive_management': 'REGULAR',
          'cohort_founders': 'FOUNDER',
          'advisory_board': 'ADVISOR',
          'global_mentors': 'MENTOR'
        };
        const legacyType = typeMap[section] || 'REGULAR';
        query = supabaseClient
          .from('team_members')
          .select('*')
          .filter('is_active', 'eq', true)
          .filter('type', 'eq', legacyType);
      } else {
        // No section filter
        query = supabaseClient
          .from('team_members')
          .select('*')
          .filter('is_active', 'eq', true);
      }

      const { data, error } = await query.order('order');

      if (error) {
        this.logger.error('Error fetching team members:', error);
        return [];
      }

      // Fetch associated media items for each team member
      const teamMembersWithMedia = await Promise.all(
        data.map(async (member) => {
          const { data: memberMediaItems, error: mediaError } = await supabaseClient
            .from('team_member_media_item')
            .select('id, type, url, alt_text, order, created_at, media_id')
            .eq('team_member_id', member.id)
            .order('order');

          if (!mediaError && memberMediaItems) {
            // Transform to match expected frontend format
            const filteredMediaItems = [];

            for (const item of memberMediaItems) {
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
                    createdAt: item.created_at || member.created_at,
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
                    createdAt: item.created_at || member.created_at,
                  });
                } else {
                  this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
                }
              }
            }

            this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for team member ${member.id}`);
            // Also provide imageUrl for the first image (primary image)
            const imageUrl = filteredMediaItems.length > 0 ? filteredMediaItems[0].url : null;
            return { ...member, mediaItems: filteredMediaItems, imageUrl };
          }

          return member;
        })
      );

      return teamMembersWithMedia;
    } catch (error) {
      this.logger.error('Unexpected error fetching team members:', error);
      return [];
    }
  }

  async createTeamMember(dto: CreateTeamMemberDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log('Creating new team member');

      // Insert the new team member
      const insertData: any = {
        name: dto.name,
        role: dto.role,
        title: dto.title || '',
        bio: dto.bio || '',
        is_active: dto.published ?? true,
        order: dto.order || 0,
      };

      // Only add section if column exists
      try {
        const { error: testError } = await supabaseClient
          .from('team_members')
          .select('section')
          .limit(1);
        
        if (!testError) {
          insertData.section = dto.section || 'executive_management';
        } else {
          // Fallback to type column for older schema
          const sectionTypeMap: Record<string, string> = {
            'executive_management': 'REGULAR',
            'cohort_founders': 'FOUNDER',
            'advisory_board': 'ADVISOR',
            'global_mentors': 'MENTOR'
          };
          insertData.type = sectionTypeMap[dto.section || 'executive_management'] || 'REGULAR';
        }
      } catch (e) {
        // Fallback to type column for older schema
        const sectionTypeMap: Record<string, string> = {
          'executive_management': 'REGULAR',
          'cohort_founders': 'FOUNDER',
          'advisory_board': 'ADVISOR',
          'global_mentors': 'MENTOR'
        };
        insertData.type = sectionTypeMap[dto.section || 'executive_management'] || 'REGULAR';
      }

      const { data: newMember, error: insertError } = await supabaseClient
        .from('team_members')
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        this.logger.error('Error creating team member:', insertError);
        throw insertError;
      }

      this.logger.log(`✅ Team member created with ID: ${newMember.id}`);

      // If media IDs were provided, link them to the team member
      if (dto.mediaIds && dto.mediaIds.length > 0) {
        // First, remove any existing media associations for this team member
        await supabaseClient
          .from('team_member_media_item')
          .delete()
          .eq('team_member_id', newMember.id);

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
              team_member_id: newMember.id,
              media_id: mediaId, // Use actual media_id instead of storing URL
              type: 'image',
              url: url, // Store the Supabase URL
              alt_text: `Team member media item ${i + 1}`,
              order: i,
            });
          } else {
            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
          }
        }

        if (mediaAssociations.length > 0) {
          const { error: mediaError } = await supabaseClient
            .from('team_member_media_item')
            .insert(mediaAssociations);

          if (mediaError) {
            this.logger.error('Error linking media to team member:', mediaError);
            // Don't throw error here as the main team member was created successfully
          } else {
            this.logger.log(`✅ Linked ${mediaAssociations.length} media items to team member`);
          }
        } else {
          this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for team member ${newMember.id}`);
        }
      }

      // Fetch and return the complete team member with media
      return await this.getTeamMembers();
    } catch (error) {
      this.logger.error('Failed to create team member', error);
      throw error;
    }
  }

  async updateTeamMember(id: string, dto: UpdateTeamMemberDto) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Updating team member with ID: ${id}`);

      // Prepare update data with proper field mapping
      const updateData: any = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.role !== undefined) updateData.role = dto.role;
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.bio !== undefined) updateData.bio = dto.bio;
      if (dto.type !== undefined) updateData.type = dto.type;
      if (dto.published !== undefined) updateData.is_active = dto.published;
      if (dto.order !== undefined) updateData.order = dto.order;

      // Update the team member
      const { data: updatedMember, error: updateError } = await supabaseClient
        .from('team_members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        this.logger.error('Error updating team member:', updateError);
        throw updateError;
      }

      this.logger.log(`✅ Team member updated with ID: ${updatedMember.id}`);

      // If media IDs were provided, update the media associations
      if (dto.mediaIds !== undefined) {
        // First, remove existing media associations for this team member
        await supabaseClient
          .from('team_member_media_item')
          .delete()
          .eq('team_member_id', id);

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
                team_member_id: id,
                media_id: mediaId, // Use actual media_id instead of storing URL
                type: 'image',
                url: url, // Store the Supabase URL
                alt_text: `Team member media item ${i + 1}`,
                order: i,
              });
            } else {
              this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
            }
          }

          if (mediaAssociations.length > 0) {
            const { error: mediaError } = await supabaseClient
              .from('team_member_media_item')
              .insert(mediaAssociations);

            if (mediaError) {
              this.logger.error('Error updating media associations:', mediaError);
              // Don't throw error here as the main team member was updated successfully
            } else {
              this.logger.log(`✅ Updated media associations for team member: ${id}`);
            }
          } else {
            this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for team member ${id}`);
          }
        }
      }

      // Fetch and return the updated team members with media
      return await this.getTeamMembers();
    } catch (error) {
      this.logger.error('Error in updateTeamMember:', error);
      throw error;
    }
  }

  async deleteTeamMember(id: string) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not available');
      }

      this.logger.log(`Deleting team member with ID: ${id}`);

      // Delete the team member (this will cascade delete media associations due to foreign key constraint)
      const { error } = await supabaseClient
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error deleting team member:', error);
        throw error;
      }

      this.logger.log(`✅ Team member deleted with ID: ${id}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to delete team member', error);
      throw error;
    }
  }

  async getTeamMembersByType(type: string) {
    try {
      const supabaseClient = this.supabase.getClient();
      if (!supabaseClient) {
        this.logger.warn('Supabase client not available, returning empty team members');
        return [];
      }

      // Map frontend types to CMS types
      const typeMap: Record<string, string> = {
        'executive': 'REGULAR',
        'cohort_founder': 'FOUNDER',
        'advisory': 'ADVISOR',
        'global_mentor': 'MENTOR'
      };
      
      const cmsType = typeMap[type] || type.toUpperCase();

      const { data, error } = await supabaseClient
        .from('team_members')
        .select('*')
        .filter('is_active', 'eq', true)
        .filter('type', 'eq', cmsType)
        .order('order');

      if (error) {
        this.logger.error('Error fetching team members by type:', error);
        return [];
      }

      // Fetch associated media items for each team member
      const teamMembersWithMedia = await Promise.all(
        data.map(async (member) => {
          const { data: memberMediaItems, error: mediaError } = await supabaseClient
            .from('team_member_media_item')
            .select('id, type, url, alt_text, order, created_at, media_id')
            .eq('team_member_id', member.id)
            .order('order');

          if (!mediaError && memberMediaItems) {
            // Transform to match expected frontend format
            const filteredMediaItems = [];

            for (const item of memberMediaItems) {
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
                    createdAt: item.created_at || member.created_at,
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
                    createdAt: item.created_at || member.created_at,
                  });
                } else {
                  this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
                }
              }
            }

            this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for team member ${member.id}`);
            // Also provide imageUrl for the first image (primary image)
            const imageUrl = filteredMediaItems.length > 0 ? filteredMediaItems[0].url : null;
            return { ...member, mediaItems: filteredMediaItems, imageUrl };
          }

          return member;
        })
      );

      return teamMembersWithMedia;
    } catch (error) {
      this.logger.error('Unexpected error fetching team members by type:', error);
      return [];
    }
  }
}