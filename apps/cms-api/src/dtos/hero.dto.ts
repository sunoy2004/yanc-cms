import { IsString, IsBoolean, IsOptional, IsArray, IsUUID, Length } from 'class-validator';

export class CreateHeroDto {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  ctaText?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  ctaLink?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  mediaIds?: string[];
}