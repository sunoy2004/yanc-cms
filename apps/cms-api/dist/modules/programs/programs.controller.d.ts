import { ProgramsService } from './programs.service';
import { CreateProgramDto } from '../../dtos/program.dto';
import { UpdateProgramDto } from '../../dtos/program-update.dto';
export declare class ProgramsController {
    private readonly programsService;
    constructor(programsService: ProgramsService);
    getPublicPrograms(): Promise<any[]>;
    createProgram(createProgramDto: CreateProgramDto): Promise<any[]>;
    updateProgram(id: string, updateProgramDto: UpdateProgramDto): Promise<any[]>;
    deleteProgram(id: string): Promise<boolean>;
    togglePublish(id: string, published: boolean): Promise<any[]>;
}
