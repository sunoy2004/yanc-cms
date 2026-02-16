export declare class CreateFounderDto {
    name: string;
    title: string;
    bio: string;
    published?: boolean;
    order?: number;
    mediaIds?: string[];
}
export declare class UpdateFounderDto {
    name?: string;
    title?: string;
    bio?: string;
    published?: boolean;
    order?: number;
    mediaIds?: string[];
}
