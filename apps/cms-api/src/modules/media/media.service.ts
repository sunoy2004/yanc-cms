import { Injectable, Logger } from '@nestjs/common';
import { GoogleDriveService } from '../../google-drive/google-drive.service';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private googleDrive: GoogleDriveService,
    private supabase: SupabaseService
  ) {
    this.logger.log('MediaService initialized - Production Mode with Supabase');
  }

  async createMedia(data: { name: string; driveId: string; mimeType: string; storageType?: string }) {
    try {
      this.logger.log(`Creating media record: ${data.name}`);
      
      const supabase = this.supabase.getClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      const { data: result, error } = await supabase
        .from('media')
        .insert({
          name: data.name,
          drive_id: data.driveId,
          mime_type: data.mimeType,
          storage_type: data.storageType || 'google_drive',
        })
        .select()
        .single();
      
      if (error) {
        this.logger.error('❌ Error creating media record:', error);
        throw error;
      }
      
      this.logger.log(`✅ Media created successfully: ${result.id}`);
      return {
        id: result.id,
        name: result.name,
        driveUrl: `https://drive.google.com/file/d/${result.drive_id}/view`,
        mimeType: result.mime_type,
        storageType: result.storage_type,
        driveId: result.drive_id,
        createdAt: result.created_at,
      };
    } catch (error) {
      this.logger.error('❌ Error creating media record:', error);
      throw error;
    }
  }

  async uploadFileToDrive(fileBuffer: Buffer, originalName: string, folderPath: string = 'uploads') {
    try {
      this.logger.log(`🚀 Starting file upload: ${originalName} to folder: ${folderPath}`);
      
      // Upload to Google Drive (only storage option in production)
      const uploadResult = await this.googleDrive.uploadFile(
        fileBuffer,
        originalName,
        folderPath,
        this.getMimeType(originalName),
      );

      this.logger.log(`✅ File uploaded to Google Drive: ${uploadResult.fileId}`);

      // Create media record in database
      const mediaItem = await this.createMedia({
        name: originalName,
        driveId: uploadResult.fileId,
        mimeType: this.getMimeType(originalName),
        storageType: 'google_drive',
      });

      this.logger.log(`✅ Media record created: ${mediaItem.id}`);
      
      return {
        id: mediaItem.id,
        name: mediaItem.name,
        driveUrl: uploadResult.url,
        mimeType: mediaItem.mimeType,
        storageType: mediaItem.storageType,
        driveId: mediaItem.driveId,
        createdAt: mediaItem.createdAt,
      };
    } catch (error) {
      this.logger.error('❌ Critical error in upload pipeline:', error);
      throw error;
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      pdf: 'application/pdf',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  async getAllMedia() {
    try {
      this.logger.log('Retrieving all media records');
      
      const supabase = this.supabase.getClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      const { data: result, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        this.logger.error('❌ Error retrieving media:', error);
        throw error;
      }
      
      this.logger.log(`✅ Retrieved ${result.length} media items`);
      // Transform snake_case fields to camelCase for frontend compatibility
      return result.map(item => ({
        id: item.id,
        name: item.name,
        driveId: item.drive_id,
        mimeType: item.mime_type,
        driveUrl: `https://drive.google.com/file/d/${item.drive_id}/view`,
        storageType: item.storage_type,
        createdAt: item.created_at,
      }));
    } catch (error) {
      this.logger.error('❌ Error retrieving media:', error);
      throw error;
    }
  }

  async deleteMedia(id: string) {
    try {
      this.logger.log(`Deleting media: ${id}`);
      
      const supabase = this.supabase.getClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      // First, try to delete from Google Drive
      const { data: mediaItem, error: fetchError } = await supabase
        .from('media')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        this.logger.error(`❌ Error fetching media item for deletion:`, fetchError);
        throw fetchError;
      }
      
      if (mediaItem && mediaItem.storage_type === 'google_drive') {
        try {
          await this.googleDrive.deleteFile(mediaItem.drive_id);
          this.logger.log(`✅ File deleted from Google Drive: ${mediaItem.drive_id}`);
        } catch (driveError) {
          this.logger.warn(`⚠️ Failed to delete from Google Drive: ${driveError.message}`);
          // Continue with database deletion even if Drive deletion fails
        }
      }
      
      // Delete from database
      const { data: result, error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (deleteError) {
        this.logger.error(`❌ Error deleting media from database:`, deleteError);
        throw deleteError;
      }
      
      this.logger.log(`✅ Media deleted from database: ${id}`);
      // Transform snake_case fields to camelCase for frontend compatibility
      return {
        id: result.id,
        name: result.name,
        driveId: result.drive_id,
        mimeType: result.mime_type,
        driveUrl: `https://drive.google.com/file/d/${result.drive_id}/view`,
        storageType: result.storage_type,
        createdAt: result.created_at,
      };
    } catch (error) {
      this.logger.error(`❌ Error deleting media ${id}:`, error);
      throw error;
    }
  }
}