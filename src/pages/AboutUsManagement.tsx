import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/cms/PageHeader';
import { PublishToggle } from '@/components/cms/PublishToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface AboutUsContent {
  id?: string;
  headline: string;
  description: string;
  vision_title: string;
  vision_desc: string;
  mission_title: string;
  mission_desc: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AboutUsManagement() {
  const { toast } = useToast();
  // Authentication temporarily disabled
  const [content, setContent] = useState<AboutUsContent>({
    headline: '',
    description: '',
    vision_title: '',
    vision_desc: '',
    mission_title: '',
    mission_desc: '',
    is_active: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current about us content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${import.meta.env.VITE_CMS_API_URL || 'http://localhost:3001'}/api/about/public`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch about us content: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data) {
          setContent({
            id: data.id,
            headline: data.headline || '',
            description: data.description || '',
            vision_title: data.vision_title || '',
            vision_desc: data.vision_desc || '',
            mission_title: data.mission_title || '',
            mission_desc: data.mission_desc || '',
            is_active: data.is_active || false,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
        } else {
          // Initialize with default values if no content exists
          setContent({
            headline: 'About Us',
            description: 'Empowering Young Minds through Life Skills\nNetworking and life skills are crucial in today\'s fast-paced world.',
            vision_title: 'Vision',
            vision_desc: 'Empowering young minds together.',
            mission_title: 'Mission',
            mission_desc: 'Building better people for better Tomorrow.',
            is_active: true
          });
        }
      } catch (err) {
        console.error('Error fetching about us content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
        toast({
          title: 'Error',
          description: 'Failed to load about us content',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [toast]);

  const handleInputChange = (field: keyof AboutUsContent, value: string | boolean) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_CMS_API_URL || 'http://localhost:3001';
      const url = content.id 
        ? `${baseUrl}/api/about/${content.id}`
        : `${baseUrl}/api/about`;
      
      const method = content.id ? 'PUT' : 'POST';
      
      const payload = {
        headline: content.headline,
        description: content.description,
        visionTitle: content.vision_title,
        visionDesc: content.vision_desc,
        missionTitle: content.mission_title,
        missionDesc: content.mission_desc,
        published: content.is_active
      };

      // Get authentication token
      const token = localStorage.getItem('yanc_cms_token');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save: ${response.statusText}`);
      }

      const savedContent = await response.json();
      
      // Update local state with saved data
      setContent({
        id: savedContent.id,
        headline: savedContent.headline,
        description: savedContent.description,
        vision_title: savedContent.vision_title,
        vision_desc: savedContent.vision_desc,
        mission_title: savedContent.mission_title,
        mission_desc: savedContent.mission_desc,
        is_active: savedContent.is_active,
        created_at: savedContent.created_at,
        updated_at: savedContent.updated_at
      });

      toast({
        title: 'Success',
        description: 'About Us content saved successfully!'
      });
    } catch (err) {
      console.error('Error saving about us content:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save content';
      setError(errorMessage);
      
      // Provide more specific error messages
      let toastMessage = 'Failed to save about us content';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        toastMessage = 'Authentication required. Please log in again.';
      } else if (errorMessage.includes('Forbidden') || errorMessage.includes('403')) {
        toastMessage = 'Insufficient permissions to save content.';
      }
      
      toast({
        title: 'Error',
        description: toastMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Authentication check removed - temporarily disabled

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="About Us Management"
        description="Manage your About Us page content and organization information."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'About Us Management' },
        ]}
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="cms-card">
          <div className="cms-card-header flex items-center justify-between">
            <div>
              <h2 className="cms-section-title">About Us Content</h2>
              <p className="cms-section-description">
                {content.updated_at 
                  ? `Last updated: ${new Date(content.updated_at).toLocaleString()}`
                  : 'Create new about us content'}
              </p>
            </div>
          </div>
          
          <div className="cms-card-content space-y-6">
            {/* Headline */}
            <div className="space-y-2">
              <Label htmlFor="headline">Headline *</Label>
              <Input
                id="headline"
                value={content.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                placeholder="About Us"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={content.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Main description of your organization..."
                rows={6}
                required
              />
            </div>

            {/* Vision Section */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium text-lg">Vision</h3>
              <div className="space-y-2">
                <Label htmlFor="vision_title">Vision Title</Label>
                <Input
                  id="vision_title"
                  value={content.vision_title}
                  onChange={(e) => handleInputChange('vision_title', e.target.value)}
                  placeholder="Vision"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vision_desc">Vision Description</Label>
                <Textarea
                  id="vision_desc"
                  value={content.vision_desc}
                  onChange={(e) => handleInputChange('vision_desc', e.target.value)}
                  placeholder="Describe your organization's vision..."
                  rows={3}
                />
              </div>
            </div>

            {/* Mission Section */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium text-lg">Mission</h3>
              <div className="space-y-2">
                <Label htmlFor="mission_title">Mission Title</Label>
                <Input
                  id="mission_title"
                  value={content.mission_title}
                  onChange={(e) => handleInputChange('mission_title', e.target.value)}
                  placeholder="Mission"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mission_desc">Mission Description</Label>
                <Textarea
                  id="mission_desc"
                  value={content.mission_desc}
                  onChange={(e) => handleInputChange('mission_desc', e.target.value)}
                  placeholder="Describe your organization's mission..."
                  rows={3}
                />
              </div>
            </div>

            {/* Publish Toggle */}
            <PublishToggle
              isPublished={content.is_active}
              onChange={(value) => handleInputChange('is_active', value)}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              {!isSaving && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Reset Form
                </Button>
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}