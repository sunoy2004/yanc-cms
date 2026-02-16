import { IsString, IsBoolean, IsNumber, IsOptional, IsArray, IsIn } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  speaker?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  eventDate?: string;

  @IsIn(['upcoming', 'past'])
  @IsOptional()
  category?: 'upcoming' | 'past';

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsOptional()
  mediaIds?: string[];

  @IsArray()
  @IsOptional()
  highlights?: string[];
}