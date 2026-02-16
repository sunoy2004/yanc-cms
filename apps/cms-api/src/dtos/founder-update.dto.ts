import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateFounderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsOptional()
  mediaIds?: string[];
}