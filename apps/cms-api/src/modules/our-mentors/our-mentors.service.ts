import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateOurMentorDto, UpdateOurMentorDto } from '../../dtos/our-mentor.dto';

@Injectable()
export class OurMentorsService {
  private readonly logger = new Logger(OurMentorsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async list(onlyActive = true) {
    const client = this.supabase.getClient();
    if (!client) return [];

    let query = client
      .from('our_mentors')
      .select('id, name, media_id, is_active, display_order, created_at, updated_at')
      .order('display_order', { ascending: true });

    if (onlyActive) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) {
      this.logger.error('Error listing our_mentors', error);
      return [];
    }

    if (!data?.length) return [];

    // Fetch media storage paths for mentor images
    const mediaIds = data.map((m) => m.media_id).filter(Boolean) as string[];
    let mediaMap = new Map<string, string>();
    if (mediaIds.length) {
      const { data: medias } = await client
        .from('media')
        .select('id, storage_path')
        .in('id', mediaIds);
      mediaMap = new Map((medias || []).map((m: any) => [m.id, m.storage_path]));
    }

    const base = process.env.SUPABASE_URL;
    return data.map((m: any) => ({
      id: m.id,
      name: m.name,
      isActive: m.is_active ?? true,
      displayOrder: m.display_order ?? 0,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      image: m.media_id && mediaMap.get(m.media_id)
        ? {
            mediaId: m.media_id,
            url: `${base}/storage/v1/object/public/media/${mediaMap.get(m.media_id)}`,
          }
        : null,
    }));
  }

  async create(dto: CreateOurMentorDto) {
    const client = this.supabase.getClient();
    if (!client) throw new Error('Supabase client not available');

    const insertData: any = {
      name: dto.name,
      media_id: dto.mediaId ?? null,
      is_active: dto.isActive ?? true,
      display_order: dto.displayOrder ?? 0,
    };

    const { error } = await client.from('our_mentors').insert(insertData);
    if (error) throw error;
    return this.list(false);
  }

  async update(id: string, dto: UpdateOurMentorDto) {
    const client = this.supabase.getClient();
    if (!client) throw new Error('Supabase client not available');

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.mediaId !== undefined) updateData.media_id = dto.mediaId;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.displayOrder !== undefined) updateData.display_order = dto.displayOrder;

    const { error } = await client.from('our_mentors').update(updateData).eq('id', id);
    if (error) throw error;
    return this.list(false);
  }

  async remove(id: string) {
    const client = this.supabase.getClient();
    if (!client) throw new Error('Supabase client not available');
    const { error } = await client.from('our_mentors').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

