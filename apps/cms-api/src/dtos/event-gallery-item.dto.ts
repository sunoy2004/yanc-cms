import { IsString, IsBoolean, IsNumber, IsOptional, IsUUID, IsArray, IsDateString } from 'class-validator';

export class CreateEventGalleryItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  /** ISO 8601 date (YYYY-MM-DD) or full timestamp */
  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  mediaIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateEventGalleryItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  mediaIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}