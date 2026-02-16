import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private supabaseStorageClient;

  constructor(
    private supabase: SupabaseService
  ) {
    this.logger.log('MediaService initialized - Production Mode with Supabase only');
    
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
      this.logger.log(`🚀 Starting file upload to Supabase: ${originalName} to folder: ${folderPath}`);
      
      // Upload to Supabase Storage only (no Google Drive fallback)
      const supabaseStoragePath = await this.uploadToSupabaseStorage(fileBuffer, originalName, folderPath);
      this.logger.log(`✅ File uploaded to Supabase Storage: ${supabaseStoragePath}`);

      // Create media record in database with Supabase-only logic
      const mediaItem = await this.createMedia({
        name: originalName,
        driveId: '', // No Google Drive integration
        mimeType: this.getMimeType(originalName),
        storageType: 'supabase_storage',  // Only Supabase storage
        storagePath: supabaseStoragePath, // URL comes from Supabase
      });

      this.logger.log(`✅ Media record created: ${mediaItem.id}`);
      
      // Return the media item with proper URL from Supabase
      const result: any = {
        id: mediaItem.id,
        name: mediaItem.name,
        mimeType: mediaItem.mimeType,
        storageType: mediaItem.storageType,
        driveId: mediaItem.driveId, // Will be empty string
        createdAt: mediaItem.createdAt,
      };
      
      // Only add URL if it exists (from Supabase)
      if (mediaItem.url) {
        result.url = mediaItem.url;
      }
      
      return result;
    } catch (error) {
      this.logger.error('❌ Critical error in Supabase upload pipeline:', error);
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
      
      // No Google Drive deletion since we only use Supabase
      
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