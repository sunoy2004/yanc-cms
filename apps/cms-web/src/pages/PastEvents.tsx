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

export default function PastEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Load past events on component mount
  useEffect(() => {
    loadPastEvents();
  }, []);

  const loadPastEvents = async () => {
    try {
      setIsDataLoading(true);
      // Load past events only
      const pastEvents = await EventsService.getPastEvents();
      setEvents(pastEvents);
    } catch (error) {
      console.error('Error loading past events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load past events. Please try again.',
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
    image: '',
    imageAlt: '',
    gallery: [] as MediaItem[],
    isPublished: true,
  });

  const getPageConfig = () => {
    return {
      title: 'Past Events',
      description: 'Manage past events and their archives.',
      breadcrumb: 'Past Events',
    };
  };

  const pageConfig = getPageConfig();
  
  const filteredEvents = events;

  const columns: Column<Event>[] = [
    {
      key: 'title',
      header: 'Event',
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.image}
            alt={item.imageAlt}
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {item.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {item.eventDate ? format(new Date(item.eventDate), 'MMM d, yyyy') : 'No date set'}
        </div>
      ),
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
      render: (item) => (
        <span
          className={cn(
            'cms-badge',
            item.isPublished ? 'cms-badge-success' : 'cms-badge-muted'
          )}
        >
          {item.isPublished ? 'Published' : 'Draft'}
        </span>
      ),
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
      image: '',
      imageAlt: '',
      gallery: [],
      isPublished: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Event) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      speaker: item.speaker || '',
      location: item.location,
      eventDate: item.eventDate,
      image: item.image,
      imageAlt: item.imageAlt || '',
      gallery: item.gallery || [],
      isPublished: item.isPublished,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Event) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        await EventsService.deleteEvent(item.id);
        await loadPastEvents(); // Reload past events from server
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

  const handleTogglePublish = async (item: Event) => {
    try {
      await EventsService.togglePublish(item.id, !item.isPublished);
      await loadPastEvents(); // Reload past events from server
      toast({
        title: item.isPublished ? 'Event unpublished' : 'Event published',
        description: `"${item.title}" is now ${item.isPublished ? 'hidden' : 'visible'}.`,
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
        published: formData.isPublished,
        displayOrder: events.length + 1,
        mediaIds: formData.gallery.map(item => item.id).filter(Boolean) as string[],
        category: 'past' as const,
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
          description: 'New past event has been added.',
        });
      }

      // Reload past events from server
      await loadPastEvents();
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
            Add Past Event
          </Button>
        }
      />

      <DataTable
        data={filteredEvents}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
        isPublished={(item) => item.isPublished}
        searchPlaceholder="Search past events..."
        emptyMessage="No past events found."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Past Event' : 'Create Past Event'}
            </DialogTitle>
            <DialogDescription>
              Configure past event details and gallery.
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