import { SupabaseService } from '../../supabase/supabase.service';
import { CreateAboutDto } from '../../dtos/about.dto';
import { UpdateAboutDto } from '../../dtos/about-update.dto';
export declare class AboutService {
    private supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    getAboutContent(): Promise<any>;
    createAboutContent(dto: CreateAboutDto): Promise<any>;
    updateAboutContent(id: string, dto: UpdateAboutDto): Promise<any>;
}
