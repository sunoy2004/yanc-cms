import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  quote: string;

  @IsString()
  author: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsOptional()
  mediaIds?: string[];
}

export class UpdateTestimonialDto {
  @IsString()
  @IsOptional()
  quote?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsOptional()
  mediaIds?: string[];
}