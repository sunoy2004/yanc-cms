import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateAboutDto {
  @IsString()
  @IsOptional()
  headline?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  visionTitle?: string;

  @IsString()
  @IsOptional()
  visionDesc?: string;

  @IsString()
  @IsOptional()
  missionTitle?: string;

  @IsString()
  @IsOptional()
  missionDesc?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsOptional()
  mediaIds?: string[];
}