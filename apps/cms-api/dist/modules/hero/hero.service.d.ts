import { SupabaseService } from '../../supabase/supabase.service';
import { CreateHeroDto } from '../../dtos/hero.dto';
import { UpdateHeroDto } from '../../dtos/hero-update.dto';
export declare class HeroService {
    private supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    getHeroContent(): Promise<any>;
    createHeroContent(dto: CreateHeroDto): Promise<any>;
    updateHeroContent(id: string, dto: UpdateHeroDto): Promise<any>;
    deleteHeroContent(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
