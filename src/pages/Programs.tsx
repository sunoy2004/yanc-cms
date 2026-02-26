import { useEffect, useState } from 'react';
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
import { Plus, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Program, MediaItem } from '@/types/cms';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';

export default function ProgramsPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image: '',
    gallery: [] as MediaItem[],
    isPublished: true,
  });

  const normalizePrograms = (apiPrograms: any[]): Program[] => {
    return (apiPrograms || []).map((p: any) => {
      const mediaItems = p.mediaItems || [];
      const firstImage = mediaItems[0]?.url || '/placeholder.svg';
      const gallery: MediaItem[] = mediaItems.map((m: any) => ({
        id: String(m.id),
        url: m.url,
        type: m.type,
        alt: m.alt,
        order: m.order,
        createdAt: m.createdAt,
      }));
      return {
        id: String(p.id),
        title: p.title,
        description: p.description || '',
        content: '', // backend does not yet store full content
        image: firstImage,
        gallery,
        isPublished: p.is_active ?? true,
        order: p.order ?? 0,
        createdAt: p.created_at || new Date().toISOString(),
        updatedAt: p.updated_at || new Date().toISOString(),
      };
    });
  };

  const loadPrograms = async () => {
    try {
      setIsDataLoading(true);
      const apiPrograms = await apiService.getPrograms();
      setPrograms(normalizePrograms(apiPrograms));
    } catch (error) {
      console.error('Error loading programs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load programs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: Column<Program>[] = [
    {
      key: 'title',
      header: 'Program',
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.image}
            alt={item.title}
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
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {new Date(item.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      image: '',
      gallery: [],
      isPublished: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Program) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content,
      image: item.image,
      gallery: item.gallery,
      isPublished: item.isPublished,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Program) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        await apiService.deleteProgram(item.id);
        setPrograms((prev) => prev.filter((i) => i.id !== item.id));
        toast({
          title: 'Program deleted',
          description: 'The program has been removed.',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete program.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleTogglePublish = async (item: Program) => {
    try {
      const updated = await apiService.toggleProgramPublish(item.id, !item.isPublished);
      setPrograms(normalizePrograms(updated));
      toast({
        title: item.isPublished ? 'Program unpublished' : 'Program published',
        description: `"${item.title}" is now ${item.isPublished ? 'hidden' : 'visible'}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update publish status.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const mediaIds = formData.gallery.map((item) => item.id);
      const payload = {
        title: formData.title,
        description: formData.description,
        published: formData.isPublished,
        order: editingItem ? editingItem.order : programs.length + 1,
        mediaIds,
      };

      if (editingItem) {
        const updated = await apiService.updateProgram(editingItem.id, payload);
        setPrograms(normalizePrograms(updated));
        toast({
          title: 'Program updated',
          description: 'Your changes have been saved.',
        });
      } else {
        const updated = await apiService.createProgram(payload);
        setPrograms(normalizePrograms(updated));
        toast({
          title: 'Program created',
          description: 'New program has been added.',
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save program. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programs"
        description="Manage your educational programs and workshops."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Programs' },
        ]}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        }
      />

      <DataTable
        data={programs}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
        isPublished={(item) => item.isPublished}
        searchPlaceholder="Search programs..."
        emptyMessage={isDataLoading ? 'Loading programs...' : 'No programs found. Create your first program.'}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Program' : 'Create Program'}
            </DialogTitle>
            <DialogDescription>
              Configure program details, content, and media gallery.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Program Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter program title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief program description"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Full Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="Detailed program content..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Program Gallery</Label>
                <MediaUploader
                  value={formData.gallery}
                  onChange={(items) =>
                    setFormData((prev) => ({ ...prev, gallery: items }))
                  }
                  maxFiles={10}
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
