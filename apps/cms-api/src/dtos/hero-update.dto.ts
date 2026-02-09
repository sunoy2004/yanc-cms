import { IsOptional, IsString, IsBoolean, IsArray, IsUrl, MaxLength } from 'class-validator';

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
  @MaxLength(100)
  ctaText?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  ctaLink?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];
}