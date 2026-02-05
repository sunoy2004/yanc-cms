import { useState } from 'react';
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
import { Plus, Loader2, Save, Linkedin, Twitter, Globe, Mail, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TeamMember, SocialLink } from '@/types/cms';
import { cn } from '@/lib/utils';

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

interface TeamManagementPageProps {
  type?: 'executive' | 'cohort_founder' | 'advisory' | 'global_mentor';
}

export default function TeamManagementPage({ type = 'executive' }: TeamManagementPageProps) {
  const { toast } = useToast();
  const filteredMembers = mockTeamMembers.filter((m) => m.memberType === type);
  const [members, setMembers] = useState<TeamMember[]>(filteredMembers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    title: '',
    bio: '',
    image: '',
    socialLinks: [] as SocialLink[],
    isPublished: true,
  });

  const pageTitle = memberTypeLabels[type] || 'Team Management';

  const columns: Column<TeamMember>[] = [
    {
      key: 'name',
      header: 'Member',
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={item.image} alt={item.name} />
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
          {item.socialLinks.map((link, index) => (
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
      image: '',
      socialLinks: [],
      isPublished: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: TeamMember) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      title: item.title,
      bio: item.bio,
      image: item.image,
      socialLinks: item.socialLinks,
      isPublished: item.isPublished,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: TeamMember) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      setMembers((prev) => prev.filter((i) => i.id !== item.id));
      toast({
        title: 'Team member deleted',
        description: 'The team member has been removed.',
      });
    }
  };

  const handleTogglePublish = (item: TeamMember) => {
    setMembers((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, isPublished: !i.isPublished } : i
      )
    );
    toast({
      title: item.isPublished ? 'Member unpublished' : 'Member published',
      description: `"${item.name}" is now ${item.isPublished ? 'hidden' : 'visible'}.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingItem) {
        setMembers((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  ...formData,
                  updatedAt: new Date().toISOString(),
                }
              : i
          )
        );
        toast({
          title: 'Team member updated',
          description: 'Your changes have been saved.',
        });
      } else {
        const newItem: TeamMember = {
          id: `temp-${Date.now()}`,
          ...formData,
          memberType: type,
          order: members.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setMembers((prev) => [...prev, newItem]);
        toast({
          title: 'Team member created',
          description: 'New team member has been added.',
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save team member. Please try again.',
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
      socialLinks: prev.socialLinks.map((link, i) =>
        i === index ? { ...link, url } : link
      ),
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
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
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>
              </div>

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
                  {formData.socialLinks.map((link, index) => (
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
