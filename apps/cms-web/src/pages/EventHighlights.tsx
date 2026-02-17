// COMMENTED OUT: EventHighlights page - temporarily disabled

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
import { Plus, Calendar, Star, Loader2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Event, MediaItem } from '@/types/cms';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { EventsService } from '@/services/events.service';

// Simple replacement component - highlights section disabled
export default function EventHighlightsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Highlights Section Disabled</h1>
      <p className="text-muted-foreground">The highlights section has been temporarily disabled.</p>
    </div>
  );
}