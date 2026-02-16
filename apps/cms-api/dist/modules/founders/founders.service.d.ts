import { SupabaseService } from '../../supabase/supabase.service';
import { CreateFounderDto } from '../../dtos/founder.dto';
import { UpdateFounderDto } from '../../dtos/founder-update.dto';
export declare class FoundersService {
    private supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    getFounders(): Promise<any[]>;
    createFounder(dto: CreateFounderDto): Promise<any[]>;
    updateFounder(id: string, dto: UpdateFounderDto): Promise<any[]>;
    deleteFounder(id: string): Promise<boolean>;
}
