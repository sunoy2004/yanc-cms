import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);
  constructor(private supabase: SupabaseService) {}

  private client() {
    return this.supabase.getClient();
  }

  /** Fetch recent changes from multiple content tables and merge them */
  async getRecent(limit = 10) {
    const client = this.client();
    if (!client) return [];

    try {
      const queries = [
        client
          .from('events')
          .select('id,title,created_at,updated_at,is_active')
          .order('updated_at', { ascending: false })
          .limit(limit),
        client
          .from('team_members')
          .select('id,name,created_at,updated_at,is_active')
          .order('updated_at', { ascending: false })
          .limit(limit),
        client
          .from('programs')
          .select('id,title,created_at,updated_at,is_active')
          .order('updated_at', { ascending: false })
          .limit(limit),
        client
          .from('hero_content')
          .select('id,title,created_at,updated_at,is_active')
          .order('updated_at', { ascending: false })
          .limit(limit),
        client
          .from('testimonials')
          .select('id,name,created_at,updated_at,is_active')
          .order('updated_at', { ascending: false })
          .limit(limit),
      ];

      const results = await Promise.all(queries);
      const normalize = (rows: any[], type: string) =>
        (rows || []).map((r) => ({
          id: r.id,
          action: new Date(r.created_at).getTime() === new Date(r.updated_at).getTime() ? 'create' : 'update',
          contentType: type,
          contentTitle: r.title || r.name || '',
          user: 'system',
          timestamp: r.updated_at,
        }));

      const [events, team, programs, hero, testimonials] = results.map((r) => (r.data ? r.data : []));

      const merged = [
        ...normalize(events, 'Event'),
        ...normalize(team, 'Team Member'),
        ...normalize(programs, 'Program'),
        ...normalize(hero, 'Hero Content'),
        ...normalize(testimonials, 'Testimonial'),
      ];

      // sort by timestamp desc and return top `limit`
      merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return merged.slice(0, limit);
    } catch (err) {
      this.logger.error('Error fetching recent activity', err);
      return [];
    }
  }
}

