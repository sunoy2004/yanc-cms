import { useState } from 'react';
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
import { Plus, Calendar, MapPin, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Event, MediaItem } from '@/types/cms';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Mock data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Annual Tech Summit 2024',
    description: 'Join us for our flagship tech summit featuring industry leaders.',
    date: '2024-03-15',
    location: 'San Francisco, CA',
    image: '/placeholder.svg',
    imageAlt: 'Tech Summit banner',
    gallery: [],
    highlights: ['Keynote speakers', 'Networking sessions', 'Workshops'],
    isPublished: true,
    isPast: true,
    order: 1,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z',
  },
  {
    id: '2',
    title: 'Startup Pitch Night',
    description: 'Watch innovative startups pitch their ideas to top investors.',
    date: '2024-04-20',
    location: 'New York, NY',
    image: '/placeholder.svg',
    imageAlt: 'Pitch Night banner',
    gallery: [],
    highlights: ['Live pitches', 'Investor panel', 'Networking dinner'],
    isPublished: true,
    isPast: true,
    order: 2,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-04-25T12:00:00Z',
  },
  {
    id: '3',
    title: 'Leadership Workshop',
    description: 'Develop your leadership skills with hands-on exercises.',
    date: '2024-06-10',
    location: 'Virtual',
    image: '/placeholder.svg',
    imageAlt: 'Leadership Workshop banner',
    gallery: [],
    highlights: ['Interactive sessions', 'Expert facilitators', 'Certification'],
    isPublished: false,
    isPast: false,
    order: 3,
    createdAt: '2024-03-15T11:00:00Z',
    updatedAt: '2024-03-15T11:00:00Z',
  },
];

interface EventsPageProps {
  type?: 'past' | 'gallery' | 'highlights';
}

export default function EventsPage({ type = 'past' }: EventsPageProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: '',
    imageAlt: '',
    gallery: [] as MediaItem[],
    highlights: [''],
    isPublished: true,
  });

  const getPageConfig = () => {
    switch (type) {
      case 'gallery':
        return {
          title: 'Event Gallery',
          description: 'Manage event photo and video galleries organized by timeline.',
          breadcrumb: 'Event Gallery',
        };
      case 'highlights':
        return {
          title: 'Event Highlights',
          description: 'Manage featured highlights and key moments from events.',
          breadcrumb: 'Event Highlights',
        };
      default:
        return {
          title: 'Past Events',
          description: 'Manage past events with details, galleries, and highlights.',
          breadcrumb: 'Past Events',
        };
    }
  };

  const pageConfig = getPageConfig();

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
          {format(new Date(item.date), 'MMM d, yyyy')}
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
      date: '',
      location: '',
      image: '',
      imageAlt: '',
      gallery: [],
      highlights: [''],
      isPublished: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Event) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      date: item.date,
      location: item.location,
      image: item.image,
      imageAlt: item.imageAlt || '',
      gallery: item.gallery,
      highlights: item.highlights.length > 0 ? item.highlights : [''],
      isPublished: item.isPublished,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Event) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      setEvents((prev) => prev.filter((i) => i.id !== item.id));
      toast({
        title: 'Event deleted',
        description: 'The event has been removed.',
      });
    }
  };

  const handleTogglePublish = (item: Event) => {
    setEvents((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, isPublished: !i.isPublished } : i
      )
    );
    toast({
      title: item.isPublished ? 'Event unpublished' : 'Event published',
      description: `"${item.title}" is now ${item.isPublished ? 'hidden' : 'visible'}.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingItem) {
        setEvents((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  ...formData,
                  highlights: formData.highlights.filter((h) => h.trim() !== ''),
                  updatedAt: new Date().toISOString(),
                }
              : i
          )
        );
        toast({
          title: 'Event updated',
          description: 'Your changes have been saved.',
        });
      } else {
        const newItem: Event = {
          id: `temp-${Date.now()}`,
          ...formData,
          highlights: formData.highlights.filter((h) => h.trim() !== ''),
          isPast: new Date(formData.date) < new Date(),
          order: events.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setEvents((prev) => [...prev, newItem]);
        toast({
          title: 'Event created',
          description: 'New event has been added.',
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, ''],
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => (i === index ? value : h)),
    }));
  };

  const removeHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
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
        data={events}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
        isPublished={(item) => item.isPublished}
        searchPlaceholder="Search events..."
        emptyMessage="No events found. Create your first event."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Event' : 'Create Event'}
            </DialogTitle>
            <DialogDescription>
              Configure event details, gallery, and highlights.
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Highlights</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addHighlight}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={highlight}
                        onChange={(e) => updateHighlight(index, e.target.value)}
                        placeholder={`Highlight ${index + 1}`}
                      />
                      {formData.highlights.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHighlight(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
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
