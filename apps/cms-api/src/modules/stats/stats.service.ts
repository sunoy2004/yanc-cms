import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);
  constructor(private supabase: SupabaseService) {}

  private client() {
    return this.supabase.getClient();
  }

  async countTable(table: string, publishedColumn = 'is_active') {
    const client = this.client();
    if (!client) return { total: 0, published: 0 };
    try {
      const [{ count: total }, { count: published }] = await Promise.all([
        client.from(table).select('id', { count: 'exact', head: true }),
        client.from(table).select('id', { count: 'exact', head: true }).neq(publishedColumn, null).eq(publishedColumn, true),
      ]);
      return { total: Number(total) || 0, published: Number(published) || 0 };
    } catch (err) {
      this.logger.error(`Error counting table ${table}`, err);
      return { total: 0, published: 0 };
    }
  }

  async getStats() {
    const events = await this.countTable('events', 'is_active');
    const team = await this.countTable('team_members', 'is_active');
    const programs = await this.countTable('programs', 'is_active');
    const testimonials = await this.countTable('testimonials', 'is_active');
    return {
      events,
      team,
      programs,
      testimonials,
    };
  }
}

