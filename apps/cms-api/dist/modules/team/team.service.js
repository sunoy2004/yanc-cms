"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TeamService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let TeamService = TeamService_1 = class TeamService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(TeamService_1.name);
    }
    async getTeamMembers(section) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                this.logger.warn('Supabase client not available, returning empty team members');
                return [];
            }
            let useSectionFilter = false;
            if (section) {
                try {
                    const { error: testError } = await supabaseClient
                        .from('team_members')
                        .select('section')
                        .limit(1);
                    if (!testError) {
                        useSectionFilter = true;
                    }
                }
                catch (e) {
                    this.logger.warn('Section column not found in team_members table');
                }
            }
            let query;
            if (useSectionFilter && section) {
                query = supabaseClient
                    .from('team_members')
                    .select('*')
                    .filter('is_active', 'eq', true)
                    .eq('section', section);
            }
            else if (section) {
                const typeMap = {
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
            }
            else {
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
            const teamMembersWithMedia = await Promise.all(data.map(async (member) => {
                const { data: memberMediaItems, error: mediaError } = await supabaseClient
                    .from('team_member_media_item')
                    .select('id, type, url, alt_text, order, created_at, media_id')
                    .eq('team_member_id', member.id)
                    .order('order');
                if (!mediaError && memberMediaItems) {
                    const filteredMediaItems = [];
                    for (const item of memberMediaItems) {
                        if (item.media_id) {
                            const { data: mediaRecord, error: mediaRecordError } = await supabaseClient
                                .from('media')
                                .select('storage_path')
                                .eq('id', item.media_id)
                                .single();
                            if (!mediaRecordError && mediaRecord && mediaRecord.storage_path) {
                                const supabaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaRecord.storage_path}`;
                                filteredMediaItems.push({
                                    id: item.id,
                                    type: item.type === 'image' ? 'image' : 'video',
                                    url: supabaseUrl,
                                    alt: item.alt_text,
                                    order: item.order,
                                    createdAt: item.created_at || member.created_at,
                                });
                            }
                            else {
                                this.logger.warn(`⚠️ Filtering out media item ${item.id} - no storage path found`);
                            }
                        }
                        else {
                            if (item.url && item.url.includes('supabase.co/storage')) {
                                filteredMediaItems.push({
                                    id: item.id,
                                    type: item.type === 'image' ? 'image' : 'video',
                                    url: item.url,
                                    alt: item.alt_text,
                                    order: item.order,
                                    createdAt: item.created_at || member.created_at,
                                });
                            }
                            else {
                                this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
                            }
                        }
                    }
                    this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for team member ${member.id}`);
                    const imageUrl = filteredMediaItems.length > 0 ? filteredMediaItems[0].url : null;
                    return { ...member, mediaItems: filteredMediaItems, imageUrl };
                }
                return member;
            }));
            return teamMembersWithMedia;
        }
        catch (error) {
            this.logger.error('Unexpected error fetching team members:', error);
            return [];
        }
    }
    async createTeamMember(dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log('Creating new team member');
            const insertData = {
                name: dto.name,
                role: dto.role,
                title: dto.title || '',
                bio: dto.bio || '',
                is_active: dto.published ?? true,
                order: dto.order || 0,
            };
            try {
                const { error: testError } = await supabaseClient
                    .from('team_members')
                    .select('section')
                    .limit(1);
                if (!testError) {
                    insertData.section = dto.section || 'executive_management';
                }
                else {
                    const sectionTypeMap = {
                        'executive_management': 'REGULAR',
                        'cohort_founders': 'FOUNDER',
                        'advisory_board': 'ADVISOR',
                        'global_mentors': 'MENTOR'
                    };
                    insertData.type = sectionTypeMap[dto.section || 'executive_management'] || 'REGULAR';
                }
            }
            catch (e) {
                const sectionTypeMap = {
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
            if (dto.mediaIds && dto.mediaIds.length > 0) {
                await supabaseClient
                    .from('team_member_media_item')
                    .delete()
                    .eq('team_member_id', newMember.id);
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
                        continue;
                    }
                    if (mediaItem.storage_path) {
                        const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaItem.storage_path}`;
                        mediaAssociations.push({
                            team_member_id: newMember.id,
                            media_id: mediaId,
                            type: 'image',
                            url: url,
                            alt_text: `Team member media item ${i + 1}`,
                            order: i,
                        });
                    }
                    else {
                        this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                    }
                }
                if (mediaAssociations.length > 0) {
                    const { error: mediaError } = await supabaseClient
                        .from('team_member_media_item')
                        .insert(mediaAssociations);
                    if (mediaError) {
                        this.logger.error('Error linking media to team member:', mediaError);
                    }
                    else {
                        this.logger.log(`✅ Linked ${mediaAssociations.length} media items to team member`);
                    }
                }
                else {
                    this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for team member ${newMember.id}`);
                }
            }
            return await this.getTeamMembers();
        }
        catch (error) {
            this.logger.error('Failed to create team member', error);
            throw error;
        }
    }
    async updateTeamMember(id, dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Updating team member with ID: ${id}`);
            const updateData = {};
            if (dto.name !== undefined)
                updateData.name = dto.name;
            if (dto.role !== undefined)
                updateData.role = dto.role;
            if (dto.title !== undefined)
                updateData.title = dto.title;
            if (dto.bio !== undefined)
                updateData.bio = dto.bio;
            if (dto.type !== undefined)
                updateData.type = dto.type;
            if (dto.published !== undefined)
                updateData.is_active = dto.published;
            if (dto.order !== undefined)
                updateData.order = dto.order;
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
            if (dto.mediaIds !== undefined) {
                await supabaseClient
                    .from('team_member_media_item')
                    .delete()
                    .eq('team_member_id', id);
                if (dto.mediaIds && dto.mediaIds.length > 0) {
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
                            continue;
                        }
                        if (mediaItem.storage_path) {
                            const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaItem.storage_path}`;
                            mediaAssociations.push({
                                team_member_id: id,
                                media_id: mediaId,
                                type: 'image',
                                url: url,
                                alt_text: `Team member media item ${i + 1}`,
                                order: i,
                            });
                        }
                        else {
                            this.logger.warn(`⚠️ Media item ${mediaId} has no Supabase Storage path, skipping association`);
                        }
                    }
                    if (mediaAssociations.length > 0) {
                        const { error: mediaError } = await supabaseClient
                            .from('team_member_media_item')
                            .insert(mediaAssociations);
                        if (mediaError) {
                            this.logger.error('Error updating media associations:', mediaError);
                        }
                        else {
                            this.logger.log(`✅ Updated media associations for team member: ${id}`);
                        }
                    }
                    else {
                        this.logger.warn(`⚠️ No media items with Supabase Storage URLs found for team member ${id}`);
                    }
                }
            }
            return await this.getTeamMembers();
        }
        catch (error) {
            this.logger.error('Error in updateTeamMember:', error);
            throw error;
        }
    }
    async deleteTeamMember(id) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Deleting team member with ID: ${id}`);
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
        }
        catch (error) {
            this.logger.error('Failed to delete team member', error);
            throw error;
        }
    }
    async getTeamMembersByType(type) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                this.logger.warn('Supabase client not available, returning empty team members');
                return [];
            }
            const typeMap = {
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
            const teamMembersWithMedia = await Promise.all(data.map(async (member) => {
                const { data: memberMediaItems, error: mediaError } = await supabaseClient
                    .from('team_member_media_item')
                    .select('id, type, url, alt_text, order, created_at, media_id')
                    .eq('team_member_id', member.id)
                    .order('order');
                if (!mediaError && memberMediaItems) {
                    const filteredMediaItems = [];
                    for (const item of memberMediaItems) {
                        if (item.media_id) {
                            const { data: mediaRecord, error: mediaRecordError } = await supabaseClient
                                .from('media')
                                .select('storage_path')
                                .eq('id', item.media_id)
                                .single();
                            if (!mediaRecordError && mediaRecord && mediaRecord.storage_path) {
                                const supabaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${mediaRecord.storage_path}`;
                                filteredMediaItems.push({
                                    id: item.id,
                                    type: item.type === 'image' ? 'image' : 'video',
                                    url: supabaseUrl,
                                    alt: item.alt_text,
                                    order: item.order,
                                    createdAt: item.created_at || member.created_at,
                                });
                            }
                            else {
                                this.logger.warn(`⚠️ Filtering out media item ${item.id} - no storage path found`);
                            }
                        }
                        else {
                            if (item.url && item.url.includes('supabase.co/storage')) {
                                filteredMediaItems.push({
                                    id: item.id,
                                    type: item.type === 'image' ? 'image' : 'video',
                                    url: item.url,
                                    alt: item.alt_text,
                                    order: item.order,
                                    createdAt: item.created_at || member.created_at,
                                });
                            }
                            else {
                                this.logger.warn(`⚠️ Filtering out media item ${item.id} - not a Supabase URL`);
                            }
                        }
                    }
                    this.logger.log(`✅ Returning ${filteredMediaItems.length} media items for team member ${member.id}`);
                    const imageUrl = filteredMediaItems.length > 0 ? filteredMediaItems[0].url : null;
                    return { ...member, mediaItems: filteredMediaItems, imageUrl };
                }
                return member;
            }));
            return teamMembersWithMedia;
        }
        catch (error) {
            this.logger.error('Unexpected error fetching team members by type:', error);
            return [];
        }
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = TeamService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], TeamService);
//# sourceMappingURL=team.service.js.map