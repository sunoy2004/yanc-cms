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
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let EventsService = EventsService_1 = class EventsService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(EventsService_1.name);
    }
    async getEvents() {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                this.logger.warn('Supabase client not available, returning empty events');
                return [];
            }
            const { data, error } = await supabaseClient
                .from('event_content')
                .select(`
          *,
          event_highlights!event_id(id, content, display_order),
          event_gallery!event_id(id, media_id)
        `)
                .order('event_date', { ascending: false })
                .order('display_order', { ascending: true });
            if (error) {
                this.logger.error('Error fetching events:', error);
                return [];
            }
            const eventsWithHighlights = data.map(event => {
                const highlights = (event.event_highlights || [])
                    .sort((a, b) => a.display_order - b.display_order)
                    .map(h => h.content);
                const galleryMediaIds = (event.event_gallery || []).map(g => g.media_id);
                const { event_highlights, event_gallery, ...eventWithoutJoins } = event;
                return {
                    ...eventWithoutJoins,
                    highlights: highlights,
                    galleryMediaIds: galleryMediaIds
                };
            });
            const eventsWithMedia = await Promise.all(eventsWithHighlights.map(async (event) => {
                if (event.galleryMediaIds && event.galleryMediaIds.length > 0) {
                    const { data: eventMediaItems, error: mediaError } = await supabaseClient
                        .from('media')
                        .select('id, name, storage_path, storage_type, mime_type, created_at')
                        .in('id', event.galleryMediaIds);
                    if (!mediaError && eventMediaItems) {
                        const mediaItems = eventMediaItems.map(media => {
                            if (media.storage_path) {
                                const supabaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${media.storage_path}`;
                                return {
                                    id: media.id,
                                    name: media.name,
                                    url: supabaseUrl,
                                    type: media.mime_type.startsWith('image') ? 'image' : 'video',
                                    alt: media.name,
                                    order: event.galleryMediaIds.indexOf(media.id),
                                    createdAt: media.created_at,
                                };
                            }
                            else {
                                return null;
                            }
                        }).filter(Boolean);
                        return { ...event, mediaItems };
                    }
                }
                return { ...event, mediaItems: [] };
            }));
            const processedEvents = eventsWithMedia.map(event => ({
                ...event,
                category: event.category || 'upcoming',
                isPublished: event.is_active ?? true,
                isPast: new Date(event.event_date) < new Date(),
                isUpcoming: new Date(event.event_date) >= new Date(),
                year: new Date(event.event_date).getFullYear(),
                month: new Date(event.event_date).toLocaleString('default', { month: 'long' }),
            }));
            return processedEvents;
        }
        catch (error) {
            this.logger.error('Unexpected error fetching events:', error);
            return [];
        }
    }
    async createEvent(dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log('Creating new event');
            const basePayload = {
                title: dto.title,
                description: dto.description || '',
                speaker: dto.speaker || '',
                location: dto.location || '',
                event_date: dto.eventDate || new Date().toISOString(),
                category: dto.category,
                type: dto.category,
                is_active: dto.published ?? true,
                display_order: dto.displayOrder || 0,
            };
            let insertPayload = {
                ...basePayload,
                registration_url: dto.registrationUrl || null,
            };
            let { data: newEvent, error: insertError } = await supabaseClient
                .from('event_content')
                .insert(insertPayload)
                .select()
                .single();
            if (insertError && (insertError.message?.includes('registration_url') || insertError.message?.includes('column') && insertError.message?.includes('does not exist'))) {
                this.logger.warn('registration_url column missing? Retrying without it. Run migration 10_add_event_registration_url.sql on event_content.');
                insertPayload = basePayload;
                const retry = await supabaseClient
                    .from('event_content')
                    .insert(insertPayload)
                    .select()
                    .single();
                if (retry.error) {
                    this.logger.error('Error creating event (retry):', retry.error);
                    throw retry.error;
                }
                newEvent = retry.data;
                insertError = null;
            }
            if (insertError) {
                this.logger.error('Error creating event:', insertError);
                throw insertError;
            }
            this.logger.log(`✅ Event created with ID: ${newEvent.id}`);
            if (dto.mediaIds && dto.mediaIds.length > 0) {
                const galleryEntries = dto.mediaIds.map((mediaId, index) => ({
                    event_id: newEvent.id,
                    media_id: mediaId,
                    display_order: index,
                }));
                const { error: galleryError } = await supabaseClient
                    .from('event_gallery')
                    .insert(galleryEntries);
                if (galleryError) {
                    this.logger.error('Error linking media to event:', galleryError);
                }
                else {
                    this.logger.log(`✅ Linked ${galleryEntries.length} media items to event`);
                }
            }
            if (dto.highlights && dto.highlights.length > 0) {
                const highlightRecords = dto.highlights
                    .filter(highlight => highlight.trim() !== '')
                    .map((highlight, index) => ({
                    event_id: newEvent.id,
                    content: highlight.trim(),
                    display_order: index,
                }));
                if (highlightRecords.length > 0) {
                    const { error: highlightsError } = await supabaseClient
                        .from('event_highlights')
                        .insert(highlightRecords);
                    if (highlightsError) {
                        this.logger.error('Error creating event highlights:', highlightsError);
                    }
                    else {
                        this.logger.log(`✅ Created ${highlightRecords.length} highlights for event`);
                    }
                }
            }
            return await this.getEvents();
        }
        catch (error) {
            this.logger.error('Error in createEvent:', error);
            throw error;
        }
    }
    async updateEvent(id, dto) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Updating event with ID: ${id}`);
            const updateData = {};
            if (dto.title !== undefined)
                updateData.title = dto.title;
            if (dto.description !== undefined)
                updateData.description = dto.description;
            if (dto.speaker !== undefined)
                updateData.speaker = dto.speaker;
            if (dto.location !== undefined)
                updateData.location = dto.location;
            if (dto.eventDate !== undefined)
                updateData.event_date = dto.eventDate;
            if (dto.registrationUrl !== undefined)
                updateData.registration_url = dto.registrationUrl || null;
            if (dto.category !== undefined)
                updateData.category = dto.category;
            if (dto.published !== undefined)
                updateData.is_active = dto.published;
            if (dto.displayOrder !== undefined)
                updateData.display_order = dto.displayOrder;
            let updatedEvent = null;
            let updateError = null;
            let result = await supabaseClient
                .from('event_content')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            updateError = result.error;
            updatedEvent = result.data;
            if (updateError && updateData.registration_url !== undefined && (updateError.message?.includes('registration_url') || (updateError.message?.includes('column') && updateError.message?.includes('does not exist')))) {
                this.logger.warn('registration_url column missing? Retrying update without it. Run migration 10_add_event_registration_url.sql on event_content.');
                const { registration_url: _r, ...rest } = updateData;
                result = await supabaseClient
                    .from('event_content')
                    .update(rest)
                    .eq('id', id)
                    .select()
                    .single();
                if (result.error) {
                    this.logger.error('Error updating event (retry):', result.error);
                    throw result.error;
                }
                updatedEvent = result.data;
                updateError = null;
            }
            if (updateError) {
                this.logger.error('Error updating event:', updateError);
                throw updateError;
            }
            this.logger.log(`✅ Event updated with ID: ${updatedEvent.id}`);
            if (dto.mediaIds !== undefined) {
                await supabaseClient
                    .from('event_gallery')
                    .delete()
                    .eq('event_id', id);
                if (dto.mediaIds && dto.mediaIds.length > 0) {
                    const galleryEntries = dto.mediaIds.map((mediaId, index) => ({
                        event_id: id,
                        media_id: mediaId,
                        display_order: index,
                    }));
                    const { error: galleryError } = await supabaseClient
                        .from('event_gallery')
                        .insert(galleryEntries);
                    if (galleryError) {
                        this.logger.error('Error updating event gallery:', galleryError);
                    }
                    else {
                        this.logger.log(`✅ Updated gallery for event: ${id}`);
                    }
                }
            }
            if (dto.highlights !== undefined) {
                await supabaseClient
                    .from('event_highlights')
                    .delete()
                    .eq('event_id', id);
                if (dto.highlights && dto.highlights.length > 0) {
                    const highlightRecords = dto.highlights
                        .filter(highlight => highlight.trim() !== '')
                        .map((highlight, index) => ({
                        event_id: id,
                        content: highlight.trim(),
                        display_order: index,
                    }));
                    if (highlightRecords.length > 0) {
                        const { error: highlightsError } = await supabaseClient
                            .from('event_highlights')
                            .insert(highlightRecords);
                        if (highlightsError) {
                            this.logger.error('Error updating event highlights:', highlightsError);
                        }
                        else {
                            this.logger.log(`✅ Updated ${highlightRecords.length} highlights for event`);
                        }
                    }
                }
            }
            return await this.getEvents();
        }
        catch (error) {
            this.logger.error('Error in updateEvent:', error);
            throw error;
        }
    }
    async deleteEvent(id) {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            this.logger.log(`Deleting event with ID: ${id}`);
            const { error } = await supabaseClient
                .from('event_content')
                .delete()
                .eq('id', id);
            if (error) {
                this.logger.error('Error deleting event:', error);
                throw error;
            }
            this.logger.log(`✅ Event deleted with ID: ${id}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error in deleteEvent:', error);
            throw error;
        }
    }
    async deletePastUpcomingEvents() {
        try {
            const supabaseClient = this.supabase.getClient();
            if (!supabaseClient)
                return 0;
            const now = new Date().toISOString();
            const { data, error } = await supabaseClient
                .from('event_content')
                .delete()
                .eq('category', 'upcoming')
                .lt('event_date', now)
                .select('id');
            if (error) {
                this.logger.warn('Error deleting past upcoming events', error);
                return 0;
            }
            const count = Array.isArray(data) ? data.length : 0;
            if (count > 0) {
                this.logger.log(`✅ Deleted ${count} past upcoming event(s) from Supabase`);
            }
            return count;
        }
        catch (err) {
            this.logger.warn('deletePastUpcomingEvents failed', err);
            return 0;
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], EventsService);
//# sourceMappingURL=events.service.js.map