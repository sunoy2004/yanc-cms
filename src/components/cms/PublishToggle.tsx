import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublishToggleProps {
  isPublished: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function PublishToggle({
  isPublished,
  onChange,
  disabled = false,
  className,
}: PublishToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border p-4',
        isPublished ? 'border-success/30 bg-success/5' : 'border-border bg-muted/50',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {isPublished ? (
          <Eye className="h-5 w-5 text-success" />
        ) : (
          <EyeOff className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <Label className="font-medium">
            {isPublished ? 'Published' : 'Draft'}
          </Label>
          <p className="text-sm text-muted-foreground">
            {isPublished
              ? 'This content is visible on the website'
              : 'This content is hidden from the website'}
          </p>
        </div>
      </div>
      <Switch
        checked={isPublished}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
