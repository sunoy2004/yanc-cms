import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'switch' | 'date' | 'url' | 'email' | 'number';
  placeholder?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

interface ContentFormProps {
  fields: FormFieldConfig[];
  schema: z.ZodSchema;
  defaultValues: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  className?: string;
}

export function ContentForm({
  fields,
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Changes',
  className,
}: ContentFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('space-y-6', className)}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {fields.map((config) => (
            <FormField
              key={config.name}
              control={form.control}
              name={config.name}
              render={({ field }) => (
                <FormItem className={cn(config.className, config.type === 'switch' && 'flex items-center justify-between rounded-lg border p-4')}>
                  <div className={cn(config.type === 'switch' && 'space-y-0.5')}>
                    <FormLabel>{config.label}</FormLabel>
                    {config.description && (
                      <FormDescription>{config.description}</FormDescription>
                    )}
                  </div>
                  <FormControl>
                    {config.type === 'textarea' ? (
                      <Textarea
                        placeholder={config.placeholder}
                        className="min-h-[120px] resize-y"
                        value={String(field.value ?? '')}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    ) : config.type === 'switch' ? (
                      <Switch
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                      />
                    ) : (
                      <Input
                        type={config.type}
                        placeholder={config.placeholder}
                        value={String(field.value ?? '')}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
