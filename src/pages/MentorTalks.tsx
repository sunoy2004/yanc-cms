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
import { Plus, Loader2, Save, Calendar, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MentorTalk, MediaItem } from '@/types/cms';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { apiService } from '@/services/api';

export default function MentorTalksPage() {
  const { toast } = useToast();
  const [talks, setTalks] = useState<MentorTalk[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MentorTalk | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Load mentor talks on component mount
  useEffect(() => {
    loadMentorTalks();
  }, []);

  const loadMentorTalks = async () => {
    try {
      setIsDataLoading(true);
      const data = await apiService.getMentorTalks();
      setTalks(data);
    } catch (error) {
      console.error('Error loading mentor talks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mentor talks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    speakerBio: '',
    date: '',
    description: '',
    content: '',
    videoUrl: '',
    thumbnail: '',
    gallery: [] as MediaItem[],
    isPublished: true,
  });

  const columns: Column<MentorTalk>[] = [
    {
      key: 'title',
      header: 'Talk',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-muted">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="h-full w-full object-cover"
            />
            {item.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.speaker}</p>
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
          {item.date ? format(new Date(item.date), 'MMM d, yyyy') : 'No date'}
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
      speaker: '',
      speakerBio: '',
      date: '',
      description: '',
      content: '',
      videoUrl: '',
      thumbnail: '',
      gallery: [],
      isPublished: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: MentorTalk) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      speaker: item.speaker,
      speakerBio: item.speakerBio,
      date: item.date || '',
      description: item.description,
      content: item.content,
      videoUrl: item.videoUrl || '',
      thumbnail: item.thumbnail || '',
      gallery: item.gallery,
      isPublished: item.isPublished,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: MentorTalk) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        await apiService.deleteMentorTalk(item.id);
        toast({
          title: 'Mentor talk deleted',
          description: 'The talk has been removed.',
        });
        loadMentorTalks(); // Refresh the data
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete talk.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleTogglePublish = async (item: MentorTalk) => {
    try {
      await apiService.toggleMentorTalkPublish(item.id, !item.isPublished);
      toast({
        title: item.isPublished ? 'Talk unpublished' : 'Talk published',
        description: `"${item.title}" is now ${item.isPublished ? 'hidden' : 'visible'}.`,
      });
      loadMentorTalks(); // Refresh the data
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
      // Extract media IDs from gallery items
      const mediaIds = formData.gallery.map(item => item.id);

      const talkData = {
        title: formData.title,
        speaker: formData.speaker,
        speakerBio: formData.speakerBio,
        talkDate: formData.date,
        description: formData.description,
        content: formData.content,
        videoUrl: formData.videoUrl,
        thumbnailUrl: formData.thumbnail,
        published: formData.isPublished,
        mediaIds: mediaIds,
        order: talks.length + 1,
      };

      if (editingItem) {
        await apiService.updateMentorTalk(editingItem.id, talkData);
        toast({
          title: 'Mentor talk updated',
          description: 'Your changes have been saved.',
        });
      } else {
        await apiService.createMentorTalk(talkData);
        toast({
          title: 'Mentor talk created',
          description: 'New talk has been added.',
        });
      }

      setIsDialogOpen(false);
      loadMentorTalks(); // Refresh the data
    } catch (error: any) {
      console.error('Error saving mentor talk:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save talk. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentor Talks"
        description="Manage mentor talk recordings and content."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Mentor Talks' },
        ]}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Talk
          </Button>
        }
      />

      <DataTable
        data={talks}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
        isPublished={(item) => item.isPublished}
        searchPlaceholder="Search talks..."
        emptyMessage={isDataLoading ? "Loading mentor talks..." : "No mentor talks found. Add your first talk."}
        isLoading={isDataLoading}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Mentor Talk' : 'Add Mentor Talk'}
            </DialogTitle>
            <DialogDescription>
              Configure talk details, video, and related media.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Talk Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter talk title"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="speaker">Speaker Name</Label>
                  <Input
                    id="speaker"
                    value={formData.speaker}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, speaker: e.target.value }))
                    }
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Talk Date</Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="speakerBio">Speaker Bio</Label>
                <Textarea
                  id="speakerBio"
                  value={formData.speakerBio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, speakerBio: e.target.value }))
                  }
                  placeholder="Brief speaker biography"
                  rows={2}
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
                  placeholder="Brief description of the talk"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-2">
                <Label>Talk Gallery</Label>
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
