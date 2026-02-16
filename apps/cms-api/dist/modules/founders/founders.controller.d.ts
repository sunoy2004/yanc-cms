import { FoundersService } from './founders.service';
import { CreateFounderDto } from '../../dtos/founder.dto';
import { UpdateFounderDto } from '../../dtos/founder-update.dto';
export declare class FoundersController {
    private readonly foundersService;
    constructor(foundersService: FoundersService);
    getPublicFounders(): Promise<any[]>;
    createFounder(createFounderDto: CreateFounderDto): Promise<any[]>;
    updateFounder(id: string, updateFounderDto: UpdateFounderDto): Promise<any[]>;
    deleteFounder(id: string): Promise<boolean>;
    togglePublish(id: string, published: boolean): Promise<any[]>;
}
