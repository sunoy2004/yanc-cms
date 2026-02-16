import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { UploadMediaDto, CreateMediaResponseDto } from '../../dtos/media.dto';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post()
  async createMedia(@Body() body: { name: string; driveId: string; mimeType: string; storageType: string }) {
    if (!body.name || !body.driveId || !body.mimeType || !body.storageType) {
      throw new BadRequestException('Missing required fields: name, driveId, mimeType, storageType');
    }

    return this.mediaService.createMedia(body);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadFile(
    @UploadedFile() file: any,
    @Body() uploadDto: UploadMediaDto,
  ): Promise<CreateMediaResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 50MB limit');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'application/pdf',
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not allowed`);
    }

    return this.mediaService.uploadFileToDrive(
      file.buffer,
      file.originalname,
      uploadDto.folder,
    );
  }

  @Get()
  async getAllMedia() {
    return this.mediaService.getAllMedia();
  }

  @Delete(':id')
  async deleteMedia(@Param('id') id: string) {
    return this.mediaService.deleteMedia(id);
  }
}