import { SupabaseService } from '../../supabase/supabase.service';
import { CreateTeamMemberDto } from '../../dtos/team.dto';
import { UpdateTeamMemberDto } from '../../dtos/team-update.dto';
export declare class TeamService {
    private supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    getTeamMembers(section?: string): Promise<any[]>;
    createTeamMember(dto: CreateTeamMemberDto): Promise<any[]>;
    updateTeamMember(id: string, dto: UpdateTeamMemberDto): Promise<any[]>;
    deleteTeamMember(id: string): Promise<boolean>;
    getTeamMembersByType(type: string): Promise<any[]>;
}
