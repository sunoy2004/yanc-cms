import { IsOptional, IsString, IsBoolean, IsArray, IsUrl, MaxLength, Matches } from 'class-validator';

export class UpdateHeroDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaText?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\/|^https?:\/\//, {
    message: 'ctaLink must be a relative path or full URL',
  })
  ctaLink?: string;

  // Alias for ctaLink to support snake_case
  @IsOptional()
  @IsString()
  @Matches(/^\/|^https?:\/\//, {
    message: 'cta_url must be a relative path or full URL',
  })
  cta_url?: string;


  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];
}