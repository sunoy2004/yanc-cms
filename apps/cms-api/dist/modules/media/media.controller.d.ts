import { MediaService } from './media.service';
import { UploadMediaDto, CreateMediaResponseDto } from '../../dtos/media.dto';
export declare class MediaController {
    private mediaService;
    constructor(mediaService: MediaService);
    createMedia(body: {
        name: string;
        driveId: string;
        mimeType: string;
        storageType: string;
    }): Promise<any>;
    uploadFile(file: any, uploadDto: UploadMediaDto): Promise<CreateMediaResponseDto>;
    getAllMedia(): Promise<any[]>;
    deleteMedia(id: string): Promise<any>;
}
