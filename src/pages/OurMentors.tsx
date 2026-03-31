import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/cms/PageHeader';
import { DataTable, Column } from '@/components/cms/DataTable';
import { MediaUploader } from '@/components/cms/MediaUploader';
import { PublishToggle } from '@/components/cms/PublishToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Plus, Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MediaItem } from '@/types/cms';
import { OurMentor, OurMentorsService } from '@/services/our-mentors.service';

const initial: OurMentor[] = [];

export default function OurMentorsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<OurMentor[]>(initial);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OurMentor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const load = async () => {
    try {
      setIsDataLoading(true);
      const data = await OurMentorsService.listAdmin();
      setItems(data);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to load Our Mentors.',
        variant: 'destructive',
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    image: [] as MediaItem[],
    isPublished: true,
    displayOrder: 0,
  });

  const columns: Column<OurMentor>[] = useMemo(
    () => [
      {
        key: 'displayOrder',
        header: 'Order',
        className: 'w-16',
        render: (item) => (
          <span className="text-sm text-muted-foreground">{item.displayOrder ?? '-'}</span>
        ),
      },
      {
        key: 'name',
        header: 'Mentor',
        render: (item) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.image?.url ? 'Image set' : 'No image'}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'isActive',
        header: 'Status',
        render: (item) => (
          <span className={`cms-badge ${item.isActive ? 'cms-badge-success' : 'cms-badge-muted'}`}>
            {item.isActive ? 'Published' : 'Draft'}
          </span>
        ),
      },
    ],
    []
  );

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      image: [],
      isPublished: true,
      displayOrder: items.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: OurMentor) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      image: item.image?.url
        ? [
            {
              id: item.image.mediaId,
              url: item.image.url,
              type: 'image',
              alt: item.name,
              order: 0,
              createdAt: item.createdAt,
            },
          ]
        : [],
      isPublished: item.isActive ?? true,
      displayOrder: item.displayOrder ?? 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: OurMentor) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await OurMentorsService.remove(item.id);
      await load();
      toast({ title: 'Deleted', description: 'Mentor removed.' });
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to delete mentor.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!formData.name.trim()) {
        toast({
          title: 'Name required',
          description: 'Please enter mentor name.',
          variant: 'destructive',
        });
        return;
      }

      const mediaId = formData.image?.[0]?.id || null;
      const payload = {
        name: formData.name.trim(),
        mediaId,
        isActive: formData.isPublished,
        displayOrder: formData.displayOrder || 0,
      };

      if (editingItem) {
        await OurMentorsService.update(editingItem.id, payload);
        toast({ title: 'Updated', description: 'Mentor updated.' });
      } else {
        await OurMentorsService.create(payload);
        toast({ title: 'Created', description: 'Mentor created.' });
      }

      await load();
      setIsDialogOpen(false);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to save mentor.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Our Mentors"
        description="Manage mentors shown on the YANC website (name + image)."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Mentors' },
          { label: 'Our Mentors' },
        ]}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mentor
          </Button>
        }
      />

      {isDataLoading ? (
        <div className="cms-card p-6 text-sm text-muted-foreground">Loading…</div>
      ) : (
        <DataTable
          data={items}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchPlaceholder="Search mentors..."
          emptyMessage="No mentors found."
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Mentor' : 'Create Mentor'}</DialogTitle>
            <DialogDescription>Only name and image are required for now.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Mentor name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter mentor name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Mentor image</Label>
                <MediaUploader
                  value={formData.image}
                  onChange={(img) => setFormData((p) => ({ ...p, image: img.slice(0, 1) }))}
                  maxFiles={1}
                />
                <p className="text-sm text-muted-foreground">Upload/select exactly 1 image.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min={0}
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, displayOrder: Number(e.target.value) || 0 }))
                  }
                />
              </div>

              <PublishToggle
                isPublished={formData.isPublished}
                onChange={(value) => setFormData((p) => ({ ...p, isPublished: value }))}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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

