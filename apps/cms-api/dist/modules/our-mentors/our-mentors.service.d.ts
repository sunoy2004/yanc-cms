import { SupabaseService } from '../../supabase/supabase.service';
import { CreateOurMentorDto, UpdateOurMentorDto } from '../../dtos/our-mentor.dto';
export declare class OurMentorsService {
    private readonly supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    list(onlyActive?: boolean): Promise<{
        id: any;
        name: any;
        isActive: any;
        displayOrder: any;
        createdAt: any;
        updatedAt: any;
        image: {
            mediaId: any;
            url: string;
        };
    }[]>;
    create(dto: CreateOurMentorDto): Promise<{
        id: any;
        name: any;
        isActive: any;
        displayOrder: any;
        createdAt: any;
        updatedAt: any;
        image: {
            mediaId: any;
            url: string;
        };
    }[]>;
    update(id: string, dto: UpdateOurMentorDto): Promise<{
        id: any;
        name: any;
        isActive: any;
        displayOrder: any;
        createdAt: any;
        updatedAt: any;
        image: {
            mediaId: any;
            url: string;
        };
    }[]>;
    remove(id: string): Promise<boolean>;
}
