import { CreateOurMentorDto, UpdateOurMentorDto } from '../../dtos/our-mentor.dto';
import { OurMentorsService } from './our-mentors.service';
export declare class OurMentorsController {
    private readonly service;
    constructor(service: OurMentorsService);
    listPublic(): Promise<{
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
    listAdmin(): Promise<{
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
