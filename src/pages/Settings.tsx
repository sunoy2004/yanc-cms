import { PageHeader } from '@/components/cms/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Key, Bell, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your CMS settings and preferences."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="cms-card p-4">
            <ul className="space-y-1">
              {[
                { icon: Key, label: 'API Configuration' },
                { icon: Bell, label: 'Notifications' },
                { icon: Shield, label: 'Security' },
                { icon: Database, label: 'Data Management' },
              ].map((item) => (
                <li key={item.label}>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          <div className="cms-card">
            <div className="cms-card-header">
              <h2 className="cms-section-title">API Configuration</h2>
              <p className="cms-section-description">
                Configure your backend API and integration settings.
              </p>
            </div>
            <div className="cms-card-content space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiUrl">API Base URL</Label>
                <Input
                  id="apiUrl"
                  placeholder="https://api.yanc.com"
                  defaultValue="https://api.yanc.com"
                />
                <p className="text-xs text-muted-foreground">
                  The base URL for your backend API server.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleDriveFolder">Google Drive Folder ID</Label>
                <Input
                  id="googleDriveFolder"
                  placeholder="Enter folder ID"
                  defaultValue="1ABC..."
                />
                <p className="text-xs text-muted-foreground">
                  The Google Drive folder where media files are stored.
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Cache Content</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable content caching for better performance.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-save Drafts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save drafts while editing.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Content Versioning</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep track of content revision history.
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
