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
import { Plus, Image, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/types/cms';
import { EventGalleryItemsService } from '@/services/event-gallery-items.service';

// Initial empty state
const initialGalleryItems: any[] = [];

export default function EventGalleryPage() {
  const { toast } = useToast();
  const [galleryItems, setGalleryItems] = useState<any[]>(initialGalleryItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Load gallery items on component mount
  useEffect(() => {
    loadGalleryItems();
  }, []);

  const loadGalleryItems = async () => {
    try {
      setIsDataLoading(true);
      // Load standalone gallery items (completely isolated from events)
      const items = await EventGalleryItemsService.getEventGalleryItems();
      setGalleryItems(items);
    } catch (error) {
      console.error('Error loading gallery items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load gallery items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gallery: [] as MediaItem[],
    isPublished: true,
    displayOrder: 0,
  });

  const getPageConfig = () => {
    return {
      title: 'Event Gallery',
      description: 'Manage event photos and media collections.',
      breadcrumb: 'Event Gallery',
    };
  };

  const pageConfig = getPageConfig();
  const filteredEvents = galleryItems;

  const getIsActive = (item: any) => item?.isActive ?? item?.is_active ?? false;

  // Normalize API media array to MediaItem[] for MediaUploader (same pattern as Past Events)
  const getGalleryForForm = (item: any): MediaItem[] => {
    const media = item?.media;
    if (!media) return [];
    const arr = Array.isArray(media) ? media : [media];
    return arr.map((m: any, index: number) => ({
      id: m.id,
      url: m.url || '',
      type: (m.type === 'video' ? 'video' : 'image') as 'image' | 'video',
      alt: m.alt ?? m.name ?? '',
      order: index,
      createdAt: m.createdAt || new Date().toISOString(),
    }));
  };

  const columns: Column<any>[] = [
    {
      key: 'title',
      header: 'Gallery Item',
      render: (item) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{item.title || 'Untitled'}</p>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {item.description || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'media',
      header: 'Media',
      render: (item) => {
        const media = item.media;
        const type = Array.isArray(media) ? (media[0]?.type ?? 'image') : (media?.type ?? 'image');
        return (
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm capitalize">{type}</span>
          </div>
        );
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => {
        const active = getIsActive(item);
        return (
          <button
            type="button"
            onClick={() => handleTogglePublish(item)}
            className={cn(
              'cms-badge cursor-pointer transition-opacity hover:opacity-90',
              active ? 'cms-badge-success' : 'cms-badge-muted'
            )}
          >
            {active ? 'Published' : 'Draft'}
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
      gallery: [],
      isPublished: true,
      displayOrder: galleryItems.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      gallery: getGalleryForForm(item),
      isPublished: getIsActive(item),
      displayOrder: item.displayOrder ?? 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: any) => {
    if (confirm(`Are you sure you want to delete this gallery item?`)) {
      try {
        await EventGalleryItemsService.deleteEventGalleryItem(item.id);
        await loadGalleryItems();
        toast({
          title: 'Item deleted',
          description: 'The gallery item has been removed.',
        });
      } catch (error) {
        console.error('Error deleting gallery item:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete gallery item. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleBulkDelete = async (items: any[]) => {
    if (items.length === 0) return;
    if (!confirm(`Delete ${items.length} gallery item(s)?`)) return;
    try {
      for (const item of items) {
        await EventGalleryItemsService.deleteEventGalleryItem(item.id);
      }
      await loadGalleryItems();
      toast({
        title: 'Items deleted',
        description: `${items.length} gallery item(s) have been removed.`,
      });
    } catch (error) {
      console.error('Error bulk deleting gallery items:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete some items. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (item: any) => {
    const active = getIsActive(item);
    try {
      await EventGalleryItemsService.togglePublish(item.id, !active);
      await loadGalleryItems();
      toast({
        title: active ? 'Item unpublished' : 'Item published',
        description: `Gallery item is now ${active ? 'hidden' : 'visible'}.`,
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
      // Convert mediaIds array to the format expected by the service
      const galleryItemData = {
        title: formData.title || undefined,
        description: formData.description || undefined,
        mediaIds: formData.gallery.length > 0 ? formData.gallery.map((item) => item.id).filter(Boolean) : undefined,
        isActive: formData.isPublished,
        displayOrder: formData.displayOrder,
      };

      if (editingItem) {
        // Update existing gallery item
        await EventGalleryItemsService.updateEventGalleryItem(editingItem.id, galleryItemData);
        toast({
          title: 'Gallery item updated',
          description: 'Your changes have been saved.',
        });
      } else {
        // Create new gallery item
        await EventGalleryItemsService.createEventGalleryItem(galleryItemData);
        toast({
          title: 'Gallery item created',
          description: 'New gallery item has been added.',
        });
      }

      // Reload gallery items from server
      await loadGalleryItems();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving gallery item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save gallery item. Please try again.',
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
            Add Gallery Item
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
        isPublished={(item) => getIsActive(item)}
        searchPlaceholder="Search gallery items..."
        emptyMessage="No gallery items found."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Gallery Item' : 'Create Gallery Item'}
            </DialogTitle>
            <DialogDescription>
              Add or edit a gallery item with a single media file.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter title for this gallery item"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Enter description for this gallery item"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Media Files</Label>
                <MediaUploader
                  value={formData.gallery}
                  onChange={(items) =>
                    setFormData((prev) => ({ ...prev, gallery: items }))
                  }
                  maxFiles={10}
                />
                <p className="text-sm text-muted-foreground">
                  Select up to 10 images or video files for this gallery item.
                </p>
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