import { SupabaseService } from '../../supabase/supabase.service';
export declare class MediaService {
    private supabase;
    private readonly logger;
    private supabaseStorageClient;
    constructor(supabase: SupabaseService);
    createMedia(data: {
        name: string;
        driveId: string;
        mimeType: string;
        storageType?: string;
        storagePath?: string;
    }): Promise<any>;
    uploadFileToDrive(fileBuffer: Buffer, originalName: string, folderPath?: string): Promise<any>;
    private uploadToSupabaseStorage;
    private getSupabaseStorageUrl;
    private getMimeType;
    getAllMedia(): Promise<any[]>;
    deleteMedia(id: string): Promise<any>;
    private deleteFromSupabaseStorage;
}
