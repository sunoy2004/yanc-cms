import { IsString, IsBoolean, IsNumber, IsOptional, IsUUID, IsArray } from 'class-validator';

export class CreateEventGalleryItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

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