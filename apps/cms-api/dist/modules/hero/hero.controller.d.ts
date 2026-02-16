import { HeroService } from './hero.service';
import { CreateHeroDto } from '../../dtos/hero.dto';
import { UpdateHeroDto } from '../../dtos/hero-update.dto';
export declare class HeroController {
    private heroService;
    private readonly logger;
    constructor(heroService: HeroService);
    getHeroContent(): Promise<any>;
    createHeroContent(createHeroDto: CreateHeroDto): Promise<any>;
    updateHeroContent(id: string, updateHeroDto: UpdateHeroDto): Promise<any>;
    deleteHeroContent(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
