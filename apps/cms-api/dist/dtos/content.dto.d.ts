export declare class HeroContentDto {
    title: string;
    subtitle: string;
    description: string;
    ctaText?: string;
    ctaLink?: string;
    imageUrl?: string;
}
export declare class SectionContentDto {
    title: string;
    content: string;
    imageUrl?: string;
    sectionType?: string;
}
export declare class TeamMemberDto {
    name: string;
    position: string;
    bio?: string;
    imageUrl?: string;
    linkedinUrl?: string;
}
export declare class EventDto {
    title: string;
    description: string;
    date: string;
    location?: string;
    imageUrl?: string;
}
