export declare class CreateProgramDto {
    title: string;
    description?: string;
    icon?: string;
    published?: boolean;
    order?: number;
    mediaIds?: string[];
}
export declare class UpdateProgramDto {
    title?: string;
    description?: string;
    icon?: string;
    published?: boolean;
    order?: number;
    mediaIds?: string[];
}
