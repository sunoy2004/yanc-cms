import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

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