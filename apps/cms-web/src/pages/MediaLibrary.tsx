import { useState } from 'react';
import { PageHeader } from '@/components/cms/PageHeader';
import { MediaUploader } from '@/components/cms/MediaUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Grid,
  List,
  Upload,
  Trash2,
  Download,
  Image as ImageIcon,
  Film,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaLibraryItem, MediaItem } from '@/types/cms';

// Mock data
const mockMediaItems: MediaLibraryItem[] = [
  {
    id: '1',
    url: '/placeholder.svg',
    type: 'image',
    alt: 'Team photo from annual summit',
    caption: 'Annual Summit 2024',
    filename: 'team-summit-2024.jpg',
    size: 2456000,
    mimeType: 'image/jpeg',
    folder: 'events',
    tags: ['team', 'summit', '2024'],
    order: 1,
    createdAt: '2024-03-15T10:00:00Z',
  },
  {
    id: '2',
    url: '/placeholder.svg',
    type: 'image',
    alt: 'Startup pitch presentation',
    caption: 'Pitch Night Winner',
    filename: 'pitch-night-winner.jpg',
    size: 1890000,
    mimeType: 'image/jpeg',
    folder: 'events',
    tags: ['pitch', 'startup', 'winner'],
    order: 2,
    createdAt: '2024-03-10T14:30:00Z',
  },
  {
    id: '3',
    url: '/placeholder.svg',
    type: 'video',
    alt: 'Keynote speech recording',
    caption: 'CEO Keynote 2024',
    thumbnailUrl: '/placeholder.svg',
    filename: 'keynote-2024.mp4',
    size: 45600000,
    mimeType: 'video/mp4',
    folder: 'videos',
    tags: ['keynote', 'ceo', '2024'],
    order: 3,
    createdAt: '2024-03-08T09:00:00Z',
  },
  {
    id: '4',
    url: '/placeholder.svg',
    type: 'image',
    alt: 'Office building exterior',
    caption: 'HQ Exterior',
    filename: 'hq-exterior.jpg',
    size: 3200000,
    mimeType: 'image/jpeg',
    folder: 'general',
    tags: ['office', 'hq', 'building'],
    order: 4,
    createdAt: '2024-02-20T16:00:00Z',
  },
];

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'image' | 'video';

export default function MediaLibrary() {
  const [mediaItems, setMediaItems] = useState<MediaLibraryItem[]>(mockMediaItems);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedItems, setUploadedItems] = useState<MediaItem[]>([]);

  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(search.toLowerCase()) ||
      item.alt?.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleDelete = () => {
    if (selectedItems.size === 0) return;
    if (confirm(`Delete ${selectedItems.size} item(s)?`)) {
      setMediaItems((prev) => prev.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
    }
  };

  const handleUploadComplete = () => {
    // In real implementation, convert uploaded items to MediaLibraryItems
    setIsUploadOpen(false);
    setUploadedItems([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Upload and manage all your media files in one place."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Media Library' },
        ]}
        actions={
          <Button onClick={() => setIsUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        }
      />

      {/* Filters & Actions */}
      <div className="cms-card">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
              <SelectTrigger className="w-32">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {selectedItems.size > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  {selectedItems.size} selected
                </span>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Media Grid/List */}
        <div className="border-t p-4">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No media found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {search
                  ? 'Try adjusting your search terms'
                  : 'Upload your first media file to get started'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelection(item.id)}
                  className={cn(
                    'group relative aspect-square cursor-pointer overflow-hidden rounded-lg border bg-muted transition-all',
                    selectedItems.has(item.id)
                      ? 'ring-2 ring-accent ring-offset-2'
                      : 'hover:ring-2 hover:ring-muted-foreground/30'
                  )}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Film className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="truncate text-xs text-white">{item.filename}</p>
                  </div>
                  <div
                    className={cn(
                      'absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded border-2 bg-white transition-opacity',
                      selectedItems.has(item.id)
                        ? 'border-accent bg-accent opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    )}
                  >
                    {selectedItems.has(item.id) && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelection(item.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-all',
                    selectedItems.has(item.id)
                      ? 'border-accent bg-accent/5'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.alt}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Film className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.filename}</p>
                    <p className="text-sm text-muted-foreground">{item.alt}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{formatFileSize(item.size)}</p>
                    <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Drag and drop files or click to browse. Files will be uploaded to Google Drive.
            </DialogDescription>
          </DialogHeader>
          <MediaUploader
            value={uploadedItems}
            onChange={setUploadedItems}
            maxFiles={20}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadComplete} disabled={uploadedItems.length === 0}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
