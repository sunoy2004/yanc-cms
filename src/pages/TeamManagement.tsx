import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/cms/PageHeader';
import { DataTable, Column } from '@/components/cms/DataTable';
import { PublishToggle } from '@/components/cms/PublishToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Loader2, Save, Linkedin, Twitter, Globe, Mail, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TeamMember, SocialLink, MediaItem } from '@/types/cms';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';

const memberTypeLabels: Record<string, string> = {
  executive: 'Executive Management',
  cohort_founder: 'Cohort Founders',
  advisory: 'Advisory Board',
  global_mentor: 'Global Mentors',
};

// Mock data
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'CEO',
    title: 'Chief Executive Officer',
    bio: 'Sarah brings 15+ years of experience in technology leadership.',
    image: '/placeholder.svg',
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com/in/sarahjohnson' },
      { platform: 'twitter', url: 'https://twitter.com/sarahjohnson' },
    ],
    memberType: 'executive',
    isPublished: true,
    order: 1,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'CTO',
    title: 'Chief Technology Officer',
    bio: 'Michael is a visionary technologist with a passion for innovation.',
    image: '/placeholder.svg',
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com/in/michaelchen' },
    ],
    memberType: 'executive',
    isPublished: true,
    order: 2,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-02-20T12:00:00Z',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Founder',
    title: 'Cohort 2023 Founder',
    bio: 'Emily founded a successful EdTech startup through the program.',
    image: '/placeholder.svg',
    socialLinks: [
      { platform: 'website', url: 'https://emilyrodriguez.com' },
    ],
    memberType: 'cohort_founder',
    isPublished: true,
    order: 1,
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-03-15T14:00:00Z',
  },
];

const sections = [
  { label: "Executive Management", value: "executive_management" },
  { label: "Cohort Founders", value: "cohort_founders" },
  { label: "Advisory Board", value: "advisory_board" },
  { label: "Global Mentors", value: "global_mentors" },
];

interface TeamManagementPageProps {
  type?: 'executive' | 'cohort_founder' | 'advisory' | 'global_mentor';
}

export default function TeamManagementPage({ type = 'executive' }: TeamManagementPageProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load team members based on section
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        // Map frontend type to backend section
        const section = type === 'executive' ? 'executive_management' : 
                       type === 'cohort_founder' ? 'cohort_founders' :
                       type === 'advisory' ? 'advisory_board' : 'global_mentors';
        
        const response = await fetch(`${import.meta.env.VITE_CMS_BASE_URL}/api/team/public?section=${section}`);
        if (response.ok) {
          const data = await response.json();
          setMembers(data);
        } else {
          console.error(`Failed to load team members for section ${section}:`, response.status, response.statusText);
          // Fallback to mock data if API fails
          setMembers(mockTeamMembers.filter((m) => m.memberType === type));
        }
      } catch (error) {
        console.error('Error loading team members:', error);
        // Fallback to mock data if API fails
        setMembers(mockTeamMembers.filter((m) => m.memberType === type));
      } finally {
        setInitialLoadComplete(true);
      }
    };

    loadTeamMembers();
  }, [type]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    title: '',
    bio: '',
    section: type === 'executive' ? 'executive_management' : 
            type === 'cohort_founder' ? 'cohort_founders' :
            type === 'advisory' ? 'advisory_board' : 'global_mentors',
    image: '',
    socialLinks: [] as SocialLink[],
    isPublished: true,
  });
  
  // Photo upload state
  const [uploadedPhoto, setUploadedPhoto] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageTitle = memberTypeLabels[type] || 'Team Management';

  const columns: Column<TeamMember>[] = [
    {
      key: 'name',
      header: 'Member',
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={item.imageUrl || item.image} alt={item.name} />
            <AvatarFallback>
              {item.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <span className="text-sm">{item.title}</span>
      ),
    },
    {
      key: 'socialLinks',
      header: 'Social',
      render: (item) => (
        <div className="flex gap-2">
          {item.socialLinks && item.socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              {link.platform === 'linkedin' && <Linkedin className="h-4 w-4" />}
              {link.platform === 'twitter' && <Twitter className="h-4 w-4" />}
              {link.platform === 'website' && <Globe className="h-4 w-4" />}
              {link.platform === 'email' && <Mail className="h-4 w-4" />}
            </a>
          ))}
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
      name: '',
      role: '',
      title: '',
      bio: '',
      section: type === 'executive' ? 'executive_management' : 
              type === 'cohort_founder' ? 'cohort_founders' :
              type === 'advisory' ? 'advisory_board' : 'global_mentors',
      image: '',
      socialLinks: [],
      isPublished: true,
    });
    setUploadedPhoto(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: TeamMember) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      title: item.title,
      bio: item.bio,
      section: item.section || (type === 'executive' ? 'executive_management' : 
                               type === 'cohort_founder' ? 'cohort_founders' :
                               type === 'advisory' ? 'advisory_board' : 'global_mentors'),
      image: item.image,
      socialLinks: item.socialLinks || [],
      isPublished: item.isPublished,
    });
    // Set uploaded photo state if there's an image URL
    if (item.image) {
      setUploadedPhoto({
        id: `existing-${item.id}`,
        url: item.image,
        type: 'image',
        alt: `${item.name} profile photo`,
        order: 0,
        createdAt: item.createdAt,
      });
    } else {
      setUploadedPhoto(null);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: TeamMember) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_CMS_BASE_URL}/api/team/${item.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Assuming JWT auth
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete team member: ${response.status} ${response.statusText}`);
        }

        // Refresh the team members list
        const updatedMembers = await response.json();
        setMembers(updatedMembers);

        toast({
          title: 'Team member deleted',
          description: 'The team member has been removed.',
        });
      } catch (error) {
        console.error('Error deleting team member:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete team member. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleTogglePublish = async (item: TeamMember) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_CMS_BASE_URL}/api/team/${item.id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Assuming JWT auth
        },
        body: JSON.stringify({ published: !item.isPublished }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle publish status: ${response.status} ${response.statusText}`);
      }

      // Update local state
      setMembers((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, isPublished: !i.isPublished } : i
        )
      );

      toast({
        title: item.isPublished ? 'Member unpublished' : 'Member published',
        description: `"${item.name}" is now ${item.isPublished ? 'hidden' : 'visible'}.`,
      });
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update publish status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.role) {
        toast({
          title: 'Missing required fields',
          description: 'Please fill in name and role',
          variant: 'destructive',
        });
        return;
      }

      // Prepare the data to send to the API
      const teamMemberData = {
        name: formData.name,
        role: formData.role,
        title: formData.title,
        bio: formData.bio,
        section: formData.section,
        published: formData.isPublished,
        order: editingItem ? editingItem.order : members.length + 1, // Use existing order if editing, otherwise calculate
        mediaIds: uploadedPhoto ? [uploadedPhoto.id] : [],
      };

      if (editingItem) {
        // Update existing team member
        const response = await fetch(`${import.meta.env.VITE_CMS_BASE_URL}/api/team/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Assuming JWT auth
          },
          body: JSON.stringify(teamMemberData),
        });

        if (!response.ok) {
          throw new Error(`Failed to update team member: ${response.status} ${response.statusText}`);
        }

        // Refresh the team members list
        const updatedMembers = await response.json();
        setMembers(updatedMembers);

        toast({
          title: 'Team member updated',
          description: 'Your changes have been saved.',
        });
      } else {
        // Create new team member
        const response = await fetch(`${import.meta.env.VITE_CMS_BASE_URL}/api/team`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Assuming JWT auth
          },
          body: JSON.stringify(teamMemberData),
        });

        if (!response.ok) {
          throw new Error(`Failed to create team member: ${response.status} ${response.statusText}`);
        }

        // Refresh the team members list
        const updatedMembers = await response.json();
        setMembers(updatedMembers);

        toast({
          title: 'Team member created',
          description: 'New team member has been added.',
        });
      }

      // Reset form and close dialog
      setIsDialogOpen(false);
      setUploadedPhoto(null);
    } catch (error) {
      console.error('Error saving team member:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save team member. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSocialLink = (platform: SocialLink['platform']) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform, url: '' }],
    }));
  };

  const updateSocialLink = (index: number, url: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks ? prev.socialLinks.map((link, i) =>
        i === index ? { ...link, url } : link
      ) : [],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks ? prev.socialLinks.filter((_, i) => i !== index) : [],
    }));
  };

  // Photo upload handlers
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Image must be smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Upload to backend with section-specific folder
      const folder = `team/${formData.section || 'general'}`;
      const result = await apiService.uploadMedia(file, folder);
      
      if (result && result.url) {
        const mediaItem: MediaItem = {
          id: result.id,
          url: result.url,
          type: 'image',
          alt: file.name,
          order: 0,
          createdAt: new Date().toISOString(),
        };
        
        setUploadedPhoto(mediaItem);
        setFormData(prev => ({ ...prev, image: result.url }));
        
        toast({
          title: 'Photo uploaded',
          description: 'Profile photo has been uploaded successfully',
        });
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload photo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = () => {
    setUploadedPhoto(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        description={`Manage ${pageTitle.toLowerCase()} profiles and information.`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Team Management' },
          { label: pageTitle },
        ]}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        }
      />

      <DataTable
        data={members}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
        isPublished={(item) => item.isPublished}
        searchPlaceholder="Search team members..."
        emptyMessage="No team members found. Add your first member."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Team Member' : 'Add Team Member'}
            </DialogTitle>
            <DialogDescription>
              Configure team member profile information and social links.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Profile Image */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.image} />
                  <AvatarFallback>
                    {formData.name
                      ? formData.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                      : 'TM'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={triggerFileSelect}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                    {uploadedPhoto && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removePhoto}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {uploadedPhoto && (
                    <p className="text-sm text-muted-foreground">
                      {uploadedPhoto.alt}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    placeholder="CEO"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Chief Executive Officer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Enter a brief biography..."
                  rows={4}
                />
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Social Links</Label>
                  <div className="flex gap-1">
                    {(['linkedin', 'twitter', 'website', 'email'] as const).map(
                      (platform) => (
                        <Button
                          key={platform}
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => addSocialLink(platform)}
                          disabled={formData.socialLinks.some(
                            (l) => l.platform === platform
                          )}
                        >
                          {platform === 'linkedin' && <Linkedin className="h-4 w-4" />}
                          {platform === 'twitter' && <Twitter className="h-4 w-4" />}
                          {platform === 'website' && <Globe className="h-4 w-4" />}
                          {platform === 'email' && <Mail className="h-4 w-4" />}
                        </Button>
                      )
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {formData.socialLinks && formData.socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted">
                        {link.platform === 'linkedin' && (
                          <Linkedin className="h-4 w-4" />
                        )}
                        {link.platform === 'twitter' && (
                          <Twitter className="h-4 w-4" />
                        )}
                        {link.platform === 'website' && (
                          <Globe className="h-4 w-4" />
                        )}
                        {link.platform === 'email' && <Mail className="h-4 w-4" />}
                      </div>
                      <Input
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, e.target.value)}
                        placeholder={`Enter ${link.platform} URL`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSocialLink(index)}
                      >
                        ×
                      </Button>
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
