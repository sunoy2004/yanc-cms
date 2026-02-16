import { useState } from 'react';
import { PageHeader } from '@/components/cms/PageHeader';
import { PublishToggle } from '@/components/cms/PublishToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Section } from '@/types/cms';

interface ContentSectionPageProps {
  type: 'about' | 'testimonials' | 'contact';
}

const sectionConfig = {
  about: {
    title: 'About Us',
    description: 'Manage your About Us page content.',
    fields: [
      { key: 'mission', label: 'Mission Statement', type: 'textarea' },
      { key: 'vision', label: 'Vision', type: 'textarea' },
      { key: 'story', label: 'Our Story', type: 'textarea' },
    ],
  },
  testimonials: {
    title: 'Testimonials',
    description: 'Manage testimonial content and settings.',
    fields: [
      { key: 'heading', label: 'Section Heading', type: 'text' },
      { key: 'subheading', label: 'Section Subheading', type: 'text' },
    ],
  },
  contact: {
    title: 'Contact Info',
    description: 'Manage contact information and details.',
    fields: [
      { key: 'email', label: 'Email Address', type: 'text' },
      { key: 'phone', label: 'Phone Number', type: 'text' },
      { key: 'address', label: 'Physical Address', type: 'textarea' },
      { key: 'hours', label: 'Business Hours', type: 'textarea' },
    ],
  },
};

// Mock data
const mockSections: Record<string, Section> = {
  about: {
    id: 'about-1',
    slug: 'about',
    title: 'About Us',
    content: '',
    metadata: {
      mission: 'To empower the next generation of innovators and leaders.',
      vision: 'A world where everyone has the opportunity to succeed.',
      story: 'Founded in 2020, YANC has grown from a small initiative to a global movement...',
    },
    isPublished: true,
    updatedAt: '2024-03-15T10:00:00Z',
  },
  testimonials: {
    id: 'testimonials-1',
    slug: 'testimonials',
    title: 'Testimonials',
    content: '',
    metadata: {
      heading: 'What People Say',
      subheading: 'Hear from our community members about their experience.',
    },
    isPublished: true,
    updatedAt: '2024-03-10T14:00:00Z',
  },
  contact: {
    id: 'contact-1',
    slug: 'contact',
    title: 'Contact Info',
    content: '',
    metadata: {
      email: 'hello@yanc.com',
      phone: '+1 (555) 123-4567',
      address: '123 Innovation Street\nSan Francisco, CA 94105',
      hours: 'Monday - Friday: 9:00 AM - 6:00 PM PST',
    },
    isPublished: true,
    updatedAt: '2024-03-12T09:00:00Z',
  },
};

export default function ContentSectionPage({ type }: ContentSectionPageProps) {
  const { toast } = useToast();
  const config = sectionConfig[type];
  const [section, setSection] = useState<Section>(mockSections[type]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFieldChange = (key: string, value: string) => {
    setSection((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSection((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
      }));

      toast({
        title: 'Content saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content Sections' },
          { label: config.title },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <div className="cms-card">
          <div className="cms-card-header flex items-center justify-between">
            <div>
              <h2 className="cms-section-title">{config.title} Content</h2>
              <p className="cms-section-description">
                Last updated: {new Date(section.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="cms-card-content space-y-6">
            {config.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={(section.metadata[field.key] as string) || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    rows={4}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={(section.metadata[field.key] as string) || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}

            <PublishToggle
              isPublished={section.isPublished}
              onChange={(value) =>
                setSection((prev) => ({ ...prev, isPublished: value }))
              }
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
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
