import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/cms/PageHeader';
import { DataTable, Column } from '@/components/cms/DataTable';
import { PublishToggle } from '@/components/cms/PublishToggle';
import { MediaUploader } from '@/components/cms/MediaUploader';
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
import { Plus, GripVertical, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { HeroContent, MediaItem } from '@/types/cms';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';

// Mock data - replace with API calls
const mockHeroItems: HeroContent[] = [
  {
    id: '1',
    title: 'Empowering Future Leaders',
    subtitle: 'Join our community of innovators and changemakers',
    ctaText: 'Get Started',
    ctaLink: '/apply',
    mediaItems: [],
    isActive: true,
    order: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  },
  {
    id: '2',
    title: 'Innovation Through Mentorship',
    subtitle: 'Connect with industry experts who guide your journey',
    ctaText: 'Meet Our Mentors',
    ctaLink: '/mentors',
    mediaItems: [],
    isActive: true,
    order: 2,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
  },
  {
    id: '3',
    title: 'Building Tomorrow Together',
    subtitle: 'Discover programs that transform ideas into reality',
    ctaText: 'Explore Programs',
    ctaLink: '/programs',
    mediaItems: [],
    isActive: false,
    order: 3,
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
  },
];

export default function HeroContentPage() {
  const { toast } = useToast();
  const [heroItems, setHeroItems] = useState<HeroContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load hero content on mount
  useEffect(() => {
    loadHeroContent();
  }, []);

  const loadHeroContent = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getHeroContent();
      
      // Normalize the data to match HeroContent interface
      const normalizedData = data ? {
        ...data,
        ctaLink: data.ctaLink || data.ctaUrl || '#', // Handle both ctaLink and ctaUrl
        mediaItems: data.mediaItems || [],
        isActive: data.isActive ?? true,
        order: data.order ?? 0,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } : null;
      
      // Convert single hero content to array for DataTable
      setHeroItems(normalizedData ? [normalizedData] : []);
    } catch (error) {
      console.error('Failed to load hero content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hero content. Using mock data.',
        variant: 'destructive',
      });
      // Fallback to mock data
      setHeroItems(mockHeroItems);
    } finally {
      setIsLoading(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    isActive: true,
    mediaItems: [] as MediaItem[],
  });

  const columns: Column<HeroContent>[] = [
    {
      key: 'order',
      header: '',
      className: 'w-12',
      render: () => (
        <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {item.subtitle}
          </p>
        </div>
      ),
    },
    {
      key: 'ctaText',
      header: 'CTA',
      render: (item) => (
        <div>
          <p className="text-sm">{item.ctaText}</p>
          <p className="text-xs text-muted-foreground">{item.ctaLink}</p>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => (
        <span
          className={cn(
            'cms-badge',
            item.isActive ? 'cms-badge-success' : 'cms-badge-muted'
          )}
        >
          {item.isActive ? 'Active' : 'Inactive'}
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
      subtitle: '',
      ctaText: '',
      ctaLink: '',
      isActive: true,
      mediaItems: [],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: HeroContent) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      subtitle: item.subtitle,
      ctaText: item.ctaText,
      ctaLink: item.ctaLink,
      isActive: item.isActive,
      mediaItems: item.mediaItems,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: HeroContent) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        await apiService.deleteHeroContent(item.id);
        setHeroItems((prev) => prev.filter((i) => i.id !== item.id));
        toast({
          title: 'Hero content deleted',
          description: 'The hero content has been removed.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete hero content.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleTogglePublish = async (item: HeroContent) => {
    try {
      const updatedItem = await apiService.updateHeroContent(item.id, {
        published: !item.isActive,
      });
      
      setHeroItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...updatedItem } : i
        )
      );
      
      toast({
        title: updatedItem.isActive ? 'Content published' : 'Content unpublished',
        description: `"${item.title}" is now ${updatedItem.isActive ? 'active' : 'inactive'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update content status.',
        variant: 'destructive',
      });
    }
  };
  const normalizeCtaLink = (link: string) => {
    // Empty CTA link → send null
    // "#" → send null  
    // Real URL or relative path → send as-is
    return !link || link === '#' ? null : link;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingItem) {
        // Update existing item
        const updatedItem = await apiService.updateHeroContent(editingItem.id, {
          title: formData.title,
          subtitle: formData.subtitle,
          ctaText: formData.ctaText,
          ctaLink: normalizeCtaLink(formData.ctaLink),
          published: formData.isActive,
          mediaIds: formData.mediaItems?.map(item => item.id) || [],
        });
        setHeroItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? { ...updatedItem }
              : i
          )
        );
        toast({
          title: 'Hero content updated',
          description: 'Your changes have been saved.',
        });
      } else {
        // Create new item
        const newItem = await apiService.createHeroContent({
          title: formData.title,
          subtitle: formData.subtitle,
          ctaText: formData.ctaText,
          ctaLink: normalizeCtaLink(formData.ctaLink),
          published: formData.isActive,
          mediaIds: formData.mediaItems?.map(item => item.id) || [],
        });
        setHeroItems((prev) => [...prev, newItem]);
        toast({
          title: 'Hero content created',
          description: 'New hero content has been added.',
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save hero content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero Content"
        description="Manage your homepage hero section content and media carousel."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Hero Content' },
        ]}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Hero Content
          </Button>
        }
      />

      <DataTable
        data={heroItems}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
        isPublished={(item) => item.isActive}
        searchPlaceholder="Search hero content..."
        emptyMessage="No hero content found. Create your first hero section."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Hero Content' : 'Create Hero Content'}
            </DialogTitle>
            <DialogDescription>
              Configure the hero section content and media for your homepage.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter hero title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  placeholder="Enter hero subtitle"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Button Text</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, ctaText: e.target.value }))
                    }
                    placeholder="Get Started"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaLink">CTA Button Link</Label>
                  <Input
                    id="ctaLink"
                    value={formData.ctaLink}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, ctaLink: e.target.value }))
                    }
                    placeholder="/apply"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Media Carousel</Label>
                <MediaUploader
                  value={formData.mediaItems}
                  onChange={(items) =>
                    setFormData((prev) => ({ ...prev, mediaItems: items }))
                  }
                  maxFiles={5}
                />
              </div>

              <PublishToggle
                isPublished={formData.isActive}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, isActive: value }))
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
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
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
