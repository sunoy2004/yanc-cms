export declare class UploadMediaDto {
    folder: string;
    description?: string;
}
export declare class CreateMediaResponseDto {
    id: string;
    name: string;
    driveId: string;
    mimeType: string;
    driveUrl: string;
    storageType: string;
    createdAt: Date;
}
