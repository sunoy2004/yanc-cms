import { AboutService } from './about.service';
import { CreateAboutDto } from '../../dtos/about.dto';
import { UpdateAboutDto } from '../../dtos/about-update.dto';
export declare class AboutController {
    private readonly aboutService;
    constructor(aboutService: AboutService);
    getPublicAbout(): Promise<any>;
    createAbout(createAboutDto: CreateAboutDto): Promise<any>;
    updateAbout(id: string, updateAboutDto: UpdateAboutDto): Promise<any>;
    togglePublish(id: string, published: boolean): Promise<any>;
}
