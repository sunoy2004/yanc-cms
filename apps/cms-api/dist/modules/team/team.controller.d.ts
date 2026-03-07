import { TeamService } from './team.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from '../../dtos/team.dto';
export declare class TeamController {
    private readonly teamService;
    constructor(teamService: TeamService);
    getPublicTeamMembers(section?: string): Promise<any[]>;
    getPublicTeamMembersByType(type: string): Promise<any[]>;
    createTeamMember(createTeamMemberDto: CreateTeamMemberDto): Promise<any[]>;
    updateTeamMemberPut(id: string, updateTeamMemberDto: UpdateTeamMemberDto): Promise<any[]>;
    updateTeamMember(id: string, updateTeamMemberDto: UpdateTeamMemberDto): Promise<any[]>;
    deleteTeamMember(id: string): Promise<boolean>;
    togglePublish(id: string, published: boolean): Promise<any[]>;
    getAdminTeamMembers(section?: string): Promise<any[]>;
}
