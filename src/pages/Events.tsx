import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/cms/PageHeader';
import { DataTable, Column } from '@/components/cms/DataTable';
import { MediaUploader } from '@/components/cms/MediaUploader';
import { PublishToggle } from '@/components/cms/PublishToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Calendar, MapPin, Loader2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Event, MediaItem } from '@/types/cms';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { EventsService } from '@/services/events.service';

// Initial empty state
const initialEvents: Event[] = [];

export default function EventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []); // Load events once on mount

  const loadEvents = async () => {
    try {
      setIsDataLoading(true);
      // Load upcoming events only
      const eventsData = await EventsService.getUpcomingEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker: '',
    location: '',
    eventDate: '',
    registrationUrl: '',
    image: '',
    imageAlt: '',
    gallery: [] as MediaItem[],
    isPublished: true,
  });

  const getPageConfig = () => {
    return {
      title: 'Upcoming Events',
      description: 'Manage upcoming events only.',
      breadcrumb: 'Upcoming Events',
    };
  };

  const pageConfig = getPageConfig();
  
  const filteredEvents = events;

  // API may return event_date / is_active (snake_case); support both for display
  const getEventDate = (item: Event & { event_date?: string }) =>
    item.eventDate || item.event_date;
  const getIsPublished = (item: Event & { is_active?: boolean }) =>
    item.isPublished ?? item.is_active ?? false;
  // API returns mediaItems; frontend uses gallery. Normalize so MediaUploader gets items with url for previews.
  const getGalleryForForm = (event: Event & { mediaItems?: Array<{ id: string; url?: string; type?: string; alt?: string; name?: string; order?: number; createdAt?: string }> }) => {
    const raw = event.gallery?.length ? event.gallery : (event.mediaItems ?? []);
    return raw.map((m: MediaItem & { name?: string }) => ({
      id: m.id,
      url: m.url || '',
      type: (m.type === 'video' ? 'video' : 'image') as 'image' | 'video',
      alt: m.alt ?? m.name ?? '',
      order: m.order ?? 0,
      createdAt: m.createdAt || new Date().toISOString(),
    }));
  };

  const columns: Column<Event>[] = [
    {
      key: 'title',
      header: 'Event',
      render: (item) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{item.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {item.description || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => {
        const dateStr = getEventDate(item as Event & { event_date?: string });
        const date = dateStr ? (() => { try { return new Date(dateStr); } catch { return null; } })() : null;
        const formatted = date && !isNaN(date.getTime()) ? format(date, 'MMM d, yyyy') : null;
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground">{formatted ?? 'No date set'}</span>
          </div>
        );
      },
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {item.location}
        </div>
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      render: (item) => {
        const published = getIsPublished(item as Event & { is_active?: boolean });
        return (
          <button
            type="button"
            onClick={() => handleTogglePublish(item)}
            className={cn(
              'cms-badge cursor-pointer transition-opacity hover:opacity-90',
              published ? 'cms-badge-success' : 'cms-badge-muted'
            )}
          >
            {published ? 'Published' : 'Draft'}
          </button>
        );
      },
    },
  ];

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      speaker: '',
      location: '',
      eventDate: '',
      registrationUrl: '',
      image: '',
      imageAlt: '',
      gallery: [],
      isPublished: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Event) => {
    setEditingItem(item);
    const regUrl = (item as Event & { registration_url?: string }).registration_url ?? item.registrationUrl ?? '';
    setFormData({
      title: item.title,
      description: item.description,
      speaker: item.speaker || '',
      location: item.location,
      eventDate: getEventDate(item as Event & { event_date?: string }) || item.eventDate,
      registrationUrl: regUrl,
      image: item.image,
      imageAlt: item.imageAlt || '',
      gallery: getGalleryForForm(item as Event & { mediaItems?: Array<{ id: string; url?: string; type?: string; alt?: string; name?: string; order?: number; createdAt?: string }> }),
      isPublished: getIsPublished(item as Event & { is_active?: boolean }),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Event) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        await EventsService.deleteEvent(item.id);
        await loadEvents();
        toast({
          title: 'Event deleted',
          description: 'The event has been removed.',
        });
      } catch (error) {
        console.error('Error deleting event:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete event. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleBulkDelete = async (items: Event[]) => {
    if (items.length === 0) return;
    if (!confirm(`Delete ${items.length} event(s)? This will remove them from Supabase.`)) return;
    try {
      for (const item of items) {
        await EventsService.deleteEvent(item.id);
      }
      await loadEvents();
      toast({
        title: 'Events deleted',
        description: `${items.length} event(s) have been removed.`,
      });
    } catch (error) {
      console.error('Error bulk deleting events:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete some events. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (item: Event) => {
    const published = getIsPublished(item as Event & { is_active?: boolean });
    try {
      await EventsService.togglePublish(item.id, !published);
      await loadEvents();
      toast({
        title: published ? 'Event unpublished' : 'Event published',
        description: `"${item.title}" is now ${published ? 'hidden' : 'visible'}.`,
      });
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update publish status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        speaker: formData.speaker,
        location: formData.location,
        eventDate: formData.eventDate,
        registrationUrl: formData.registrationUrl.trim() || undefined,
        published: formData.isPublished,
        displayOrder: events.length + 1,
        mediaIds: formData.gallery.map(item => item.id).filter(Boolean) as string[],
        category: 'upcoming' as const,
      };

      if (editingItem) {
        // Update existing event
        await EventsService.updateEvent(editingItem.id, eventData);
        toast({
          title: 'Event updated',
          description: 'Your changes have been saved.',
        });
      } else {
        // Create new event
        await EventsService.createEvent(eventData);
        toast({
          title: 'Event created',
          description: 'New event has been added.',
        });
      }

      // Reload events from server
      await loadEvents();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: 'Failed to save event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageConfig.title}
        description={pageConfig.description}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Events' },
          { label: pageConfig.breadcrumb },
        ]}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        }
      />



      <DataTable
        data={filteredEvents}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onTogglePublish={handleTogglePublish}
        isPublished={(item) => getIsPublished(item as Event & { is_active?: boolean })}
        searchPlaceholder="Search events..."
        emptyMessage="No events found. Create your first event."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Upcoming Event' : 'Create Upcoming Event'}
            </DialogTitle>
            <DialogDescription>
              Configure upcoming event details and gallery.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="speaker">Speaker</Label>
                <Input
                  id="speaker"
                  value={formData.speaker}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, speaker: e.target.value }))
                  }
                  placeholder="Enter speaker name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, eventDate: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="City, State or Virtual"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationUrl">Registration URL</Label>
                <Input
                  id="registrationUrl"
                  type="url"
                  value={formData.registrationUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, registrationUrl: e.target.value }))
                  }
                  placeholder="https://example.com/register"
                />
                <p className="text-xs text-muted-foreground">
                  Used by the &quot;Register Now&quot; button on the website for this event.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Event Gallery</Label>
                <MediaUploader
                  value={formData.gallery}
                  onChange={(items) =>
                    setFormData((prev) => ({ ...prev, gallery: items }))
                  }
                  maxFiles={20}
                />
              </div>

              <PublishToggle
                isPublished={formData.isPublished}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, isPublished: value }))
                }
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingItem ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}