import { Injectable, Logger } from '@nestjs/common';
import { GoogleDriveService } from '../../google-drive/google-drive.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private supabaseStorageClient;

  constructor(
    private googleDrive: GoogleDriveService,
    private supabase: SupabaseService
  ) {
    this.logger.log('MediaService initialized - Production Mode with Supabase');
    
    // Initialize Supabase Storage client with SERVICE ROLE KEY for upload permissions
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceRoleKey) {
      this.supabaseStorageClient = createClient(supabaseUrl, supabaseServiceRoleKey);
      this.logger.log('✅ Supabase Storage client initialized with service role key');
    } else {
      this.logger.error('❌ Supabase Storage service role key not configured - uploads will fail');
    }
  }

  async createMedia(data: { name: string; driveId: string; mimeType: string; storageType?: string; storagePath?: string }) {
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
          drive_id: data.driveId, // Keep for archival purposes
          mime_type: data.mimeType,
          storage_type: data.storageType || 'supabase_storage',
          storage_path: data.storagePath, // Store Supabase Storage path
        })
        .select()
        .single();
      
      if (error) {
        this.logger.error('❌ Error creating media record:', error);
        throw error;
      }
      
      this.logger.log(`✅ Media created successfully: ${result.id}`);
      
      // Apply storage branching: Supabase for frontend, Google Drive for archive only
      const mediaResponse: any = {
        id: result.id,
        name: result.name,
        mimeType: result.mime_type,
        storageType: result.storage_type,
        driveId: result.drive_id,
        createdAt: result.created_at,
      };
      
      // ONLY include URL if it's from Supabase Storage (never include Drive URLs)
      if (data.storagePath) {
        mediaResponse.url = this.getSupabaseStorageUrl(data.storagePath);
      } else if (result.storage_path) {
        mediaResponse.url = this.getSupabaseStorageUrl(result.storage_path);
      } else {
        // If only Google Drive exists, do not include a URL in the response
        // This prevents Drive URL leakage to the frontend
        this.logger.warn(`⚠️ Media ${result.id} only has Google Drive storage, no URL exposed to frontend`);
      }
      
      return mediaResponse;
    } catch (error) {
      this.logger.error('❌ Error creating media record:', error);
      throw error;
    }
  }

  async uploadFileToDrive(fileBuffer: Buffer, originalName: string, folderPath: string = 'uploads') {
    try {
      this.logger.log(`🚀 Starting file upload: ${originalName} to folder: ${folderPath}`);
      
      // First, upload to Supabase Storage for reliable web delivery
      let supabaseStoragePath = null;
      let supabaseUploadSuccess = false;
      
      try {
        supabaseStoragePath = await this.uploadToSupabaseStorage(fileBuffer, originalName, folderPath);
        supabaseUploadSuccess = true;
        this.logger.log(`✅ File uploaded to Supabase Storage: ${supabaseStoragePath}`);
      } catch (storageError) {
        this.logger.warn(`⚠️ Supabase Storage upload failed (attempting Google Drive fallback):`, storageError);
        supabaseUploadSuccess = false;
      }

      // Upload to Google Drive for archival purposes only (never affects storageType decision)
      let driveFileId = null;
      
      try {
        // Always attempt Google Drive upload for archival, regardless of Supabase success
        const driveResult = await this.googleDrive.uploadFile(
          fileBuffer,
          originalName,
          folderPath,
          this.getMimeType(originalName),
        );
        driveFileId = driveResult.fileId;
        this.logger.log(`✅ File uploaded to Google Drive for archival: ${driveFileId}`);
      } catch (driveError) {
        this.logger.warn(`⚠️ Google Drive archival upload failed:`, driveError);
        // We can continue with just Supabase if Google Drive fails
        if (!supabaseUploadSuccess) {
          // If both failed, throw error
          this.logger.error(`❌ Both Supabase and Google Drive uploads failed:`, driveError);
          throw new Error(`All storage options failed. Upload failed: ${driveError.message}`);
        }
      }

      // DECISION LOGIC: Supabase Storage is ALWAYS authoritative if successful
      // Google Drive is archive only and must never influence storageType
      const effectiveStorageType = supabaseUploadSuccess ? 'supabase_storage' : 'google_drive';
      
      // Create media record in database with clear storage branching logic
      const mediaItem = await this.createMedia({
        name: originalName,
        driveId: driveFileId || '', // Keep for archival if available
        mimeType: this.getMimeType(originalName),
        storageType: effectiveStorageType,  // Supabase wins if successful
        storagePath: supabaseStoragePath,   // URL comes from Supabase if available
      });

      this.logger.log(`✅ Media record created: ${mediaItem.id}`);
      
      // Return the media item with proper URL based on storage type
      const result: any = {
        id: mediaItem.id,
        name: mediaItem.name,
        mimeType: mediaItem.mimeType,
        storageType: mediaItem.storageType,
        driveId: mediaItem.driveId,
        createdAt: mediaItem.createdAt,
      };
      
      // Only add URL if it exists (for Supabase Storage only)
      if (mediaItem.url) {
        result.url = mediaItem.url;
      }
      
      return result;
    } catch (error) {
      this.logger.error('❌ Critical error in upload pipeline:', error);
      throw error;
    }
  }

  private async uploadToSupabaseStorage(fileBuffer: Buffer, fileName: string, folderPath: string): Promise<string> {
    if (!this.supabaseStorageClient) {
      throw new Error('Supabase Storage client not available');
    }

    const bucketName = 'media';
    const filePath = `${folderPath}/${Date.now()}_${fileName}`;
    
    try {
      const { data, error } = await this.supabaseStorageClient
        .storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: this.getMimeType(fileName),
          upsert: true,
        });

      if (error) {
        throw error;
      }

      this.logger.log(`✅ File uploaded to Supabase Storage: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`❌ Error uploading to Supabase Storage:`, error);
      throw error;
    }
  }

  private getSupabaseStorageUrl(storagePath: string): string {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable not set');
    }
    
    return `${supabaseUrl}/storage/v1/object/public/media/${storagePath}`;
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
      // Apply storage branching: only return Supabase URLs to frontend
      return result.map(item => {
        const mediaItem: any = {
          id: item.id,
          name: item.name,
          driveId: item.drive_id,
          mimeType: item.mime_type,
          storageType: item.storage_type,
          createdAt: item.created_at,
        };
        
        // ONLY include URL if it's from Supabase Storage (never include Drive URLs)
        if (item.storage_path) {
          mediaItem.url = this.getSupabaseStorageUrl(item.storage_path);
        }
        
        return mediaItem;
      });
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
      
      // First, try to delete from database to get the record
      const { data: mediaItem, error: fetchError } = await supabase
        .from('media')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        this.logger.error(`❌ Error fetching media item for deletion:`, fetchError);
        throw fetchError;
      }
      
      // Delete from Supabase Storage if path exists
      if (mediaItem && mediaItem.storage_path) {
        try {
          await this.deleteFromSupabaseStorage(mediaItem.storage_path);
          this.logger.log(`✅ File deleted from Supabase Storage: ${mediaItem.storage_path}`);
        } catch (storageError) {
          this.logger.warn(`⚠️ Failed to delete from Supabase Storage: ${storageError.message}`);
          // Continue with database deletion even if storage deletion fails
        }
      }
      
      // Optionally delete from Google Drive if drive_id exists
      if (mediaItem && mediaItem.drive_id && mediaItem.storage_type === 'google_drive') {
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
      // Apply storage branching: only return Supabase URLs to frontend
      const deletedMediaItem: any = {
        id: result.id,
        name: result.name,
        driveId: result.drive_id,
        mimeType: result.mime_type,
        storageType: result.storage_type,
        createdAt: result.created_at,
      };
      
      // ONLY include URL if it's from Supabase Storage (never include Drive URLs)
      if (result.storage_path) {
        deletedMediaItem.url = this.getSupabaseStorageUrl(result.storage_path);
      }
      
      return deletedMediaItem;
    } catch (error) {
      this.logger.error(`❌ Error deleting media ${id}:`, error);
      throw error;
    }
  }

  private async deleteFromSupabaseStorage(storagePath: string) {
    if (!this.supabaseStorageClient) {
      throw new Error('Supabase Storage client not available');
    }

    const bucketName = 'media';
    
    try {
      const { error } = await this.supabaseStorageClient
        .storage
        .from(bucketName)
        .remove([storagePath]);

      if (error) {
        throw error;
      }
    } catch (error) {
      this.logger.error(`❌ Error deleting from Supabase Storage:`, error);
      throw error;
    }
  }
}