import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UploadMediaDto {
  @IsString()
  @IsNotEmpty()
  folder: string;

  @IsOptional()
  @MaxLength(255)
  description?: string;
}

export class CreateMediaResponseDto {
  id: string;
  name: string;
  driveId: string;
  mimeType: string;
  driveUrl: string;
  storageType: string;
  createdAt: Date;
}