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
import { Plus, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Program, MediaItem } from '@/types/cms';
import { cn } from '@/lib/utils';

// Mock data
const mockPrograms: Program[] = [
  {
    id: '1',
    title: 'Startup Accelerator',
    description: 'A 12-week intensive program for early-stage startups.',
    content: 'Full program content goes here...',
    image: '/placeholder.svg',
    gallery: [],
    isPublished: true,
    order: 1,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z',
  },
  {
    id: '2',
    title: 'Leadership Workshop Series',
    description: 'Develop essential leadership skills through hands-on workshops.',
    content: 'Workshop series content...',
    image: '/placeholder.svg',
    gallery: [],
    isPublished: true,
    order: 2,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-20T12:00:00Z',
  },
  {
    id: '3',
    title: 'Mentorship Program',
    description: 'Connect with experienced mentors in your industry.',
    content: 'Mentorship program details...',
    image: '/placeholder.svg',
    gallery: [],
    isPublished: false,
    order: 3,
    createdAt: '2024-03-15T11:00:00Z',
    updatedAt: '2024-03-15T11:00:00Z',
  },
];

export default function ProgramsPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
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

  const handleDelete = (item: Program) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      setPrograms((prev) => prev.filter((i) => i.id !== item.id));
      toast({
        title: 'Program deleted',
        description: 'The program has been removed.',
      });
    }
  };

  const handleTogglePublish = (item: Program) => {
    setPrograms((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, isPublished: !i.isPublished } : i
      )
    );
    toast({
      title: item.isPublished ? 'Program unpublished' : 'Program published',
      description: `"${item.title}" is now ${item.isPublished ? 'hidden' : 'visible'}.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingItem) {
        setPrograms((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? { ...i, ...formData, updatedAt: new Date().toISOString() }
              : i
          )
        );
        toast({
          title: 'Program updated',
          description: 'Your changes have been saved.',
        });
      } else {
        const newItem: Program = {
          id: `temp-${Date.now()}`,
          ...formData,
          order: programs.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPrograms((prev) => [...prev, newItem]);
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
        emptyMessage="No programs found. Create your first program."
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
