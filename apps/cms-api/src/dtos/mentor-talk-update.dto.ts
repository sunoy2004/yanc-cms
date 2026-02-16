import { IsString, IsOptional, IsBoolean, IsDateString, IsArray, IsUUID } from 'class-validator';

export class UpdateMentorTalkDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  speaker?: string;

  @IsString()
  @IsOptional()
  speakerBio?: string;

  @IsDateString()
  @IsOptional()
  talkDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsArray()
  @IsOptional()
  mediaIds?: string[];

  @IsOptional()
  order?: number;
}