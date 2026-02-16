export declare class CreateTeamMemberDto {
    name: string;
    role: string;
    title?: string;
    bio?: string;
    section: string;
    published?: boolean;
    order?: number;
    mediaIds?: string[];
}
export declare class UpdateTeamMemberDto {
    name?: string;
    role?: string;
    title?: string;
    bio?: string;
    section?: string;
    published?: boolean;
    order?: number;
    mediaIds?: string[];
}
