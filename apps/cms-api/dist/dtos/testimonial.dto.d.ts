export declare class CreateTestimonialDto {
    quote: string;
    author: string;
    company?: string;
    published?: boolean;
    order?: number;
    mediaIds?: string[];
}
export declare class UpdateTestimonialDto {
    quote?: string;
    author?: string;
    company?: string;
    published?: boolean;
    order?: number;
    mediaIds?: string[];
}
