import { SupabaseService } from '../../supabase/supabase.service';
import { CreateProgramDto } from '../../dtos/program.dto';
import { UpdateProgramDto } from '../../dtos/program-update.dto';
export declare class ProgramsService {
    private supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    getPrograms(): Promise<any[]>;
    createProgram(dto: CreateProgramDto): Promise<any[]>;
    updateProgram(id: string, dto: UpdateProgramDto): Promise<any[]>;
    deleteProgram(id: string): Promise<boolean>;
}
