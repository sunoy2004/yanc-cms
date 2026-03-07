"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
const supabase_js_1 = require("@supabase/supabase-js");
const imageProcessor_1 = require("../../utils/imageProcessor");
const ENABLE_IMAGE_OPTIMIZATION = false;
let MediaService = MediaService_1 = class MediaService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(MediaService_1.name);
        this.logger.log('MediaService initialized - Production Mode with Supabase only');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseServiceRoleKey) {
            this.supabaseStorageClient = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey);
            this.logger.log('✅ Supabase Storage client initialized with service role key');
        }
        else {
            this.logger.error('❌ Supabase Storage service role key not configured - uploads will fail');
        }
    }
    async createMedia(data) {
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
                storage_type: data.storageType || 'supabase_storage',
                storage_path: data.storagePath,
            })
                .select()
                .single();
            if (error) {
                this.logger.error('❌ Error creating media record:', error);
                throw error;
            }
            this.logger.log(`✅ Media created successfully: ${result.id}`);
            const mediaResponse = {
                id: result.id,
                name: result.name,
                mimeType: result.mime_type,
                storageType: result.storage_type,
                driveId: result.drive_id,
                createdAt: result.created_at,
            };
            if (data.storagePath) {
                mediaResponse.url = this.getSupabaseStorageUrl(data.storagePath);
            }
            else if (result.storage_path) {
                mediaResponse.url = this.getSupabaseStorageUrl(result.storage_path);
            }
            else {
                this.logger.warn(`⚠️ Media ${result.id} only has Google Drive storage, no URL exposed to frontend`);
            }
            return mediaResponse;
        }
        catch (error) {
            this.logger.error('❌ Error creating media record:', error);
            throw error;
        }
    }
    async uploadFileToDrive(fileBuffer, originalName, folderPath = 'uploads') {
        try {
            this.logger.log(`🚀 Starting file upload to Supabase: ${originalName} to folder: ${folderPath}`);
            const mimeType = this.getMimeType(originalName);
            const isImage = mimeType.startsWith('image/');
            let finalBuffer = fileBuffer;
            let storedFileName = originalName;
            let storedMimeType = mimeType;
            if (ENABLE_IMAGE_OPTIMIZATION && isImage) {
                this.logger.log(`Optimizing image before upload (WebP conversion): ${originalName}`);
                finalBuffer = await (0, imageProcessor_1.convertToWebp)(fileBuffer);
                const dotIndex = originalName.lastIndexOf('.');
                const baseName = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
                storedFileName = `${baseName}.webp`;
                storedMimeType = 'image/webp';
            }
            const supabaseStoragePath = await this.uploadToSupabaseStorage(finalBuffer, storedFileName, folderPath);
            this.logger.log(`✅ File uploaded to Supabase Storage: ${supabaseStoragePath}`);
            const mediaItem = await this.createMedia({
                name: originalName,
                driveId: '',
                mimeType: storedMimeType,
                storageType: 'supabase_storage',
                storagePath: supabaseStoragePath,
            });
            this.logger.log(`✅ Media record created: ${mediaItem.id}`);
            const result = {
                id: mediaItem.id,
                name: mediaItem.name,
                mimeType: mediaItem.mimeType,
                storageType: mediaItem.storageType,
                driveId: mediaItem.driveId,
                createdAt: mediaItem.createdAt,
            };
            if (mediaItem.url) {
                result.url = mediaItem.url;
            }
            return result;
        }
        catch (error) {
            this.logger.error('❌ Critical error in Supabase upload pipeline:', error);
            throw error;
        }
    }
    async uploadToSupabaseStorage(fileBuffer, fileName, folderPath) {
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
                cacheControl: '3600',
                upsert: true,
            });
            if (error) {
                throw error;
            }
            this.logger.log(`✅ File uploaded to Supabase Storage: ${filePath}`);
            return filePath;
        }
        catch (error) {
            this.logger.error(`❌ Error uploading to Supabase Storage:`, error);
            throw error;
        }
    }
    getSupabaseStorageUrl(storagePath) {
        const supabaseUrl = process.env.SUPABASE_URL;
        if (!supabaseUrl) {
            throw new Error('SUPABASE_URL environment variable not set');
        }
        return `${supabaseUrl}/storage/v1/object/public/media/${storagePath}`;
    }
    getMimeType(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        const mimeTypes = {
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
            return result.map(item => {
                const mediaItem = {
                    id: item.id,
                    name: item.name,
                    driveId: item.drive_id,
                    mimeType: item.mime_type,
                    storageType: item.storage_type,
                    createdAt: item.created_at,
                };
                if (item.storage_path) {
                    mediaItem.url = this.getSupabaseStorageUrl(item.storage_path);
                }
                return mediaItem;
            });
        }
        catch (error) {
            this.logger.error('❌ Error retrieving media:', error);
            throw error;
        }
    }
    async deleteMedia(id) {
        try {
            this.logger.log(`Deleting media: ${id}`);
            const supabase = this.supabase.getClient();
            if (!supabase) {
                throw new Error('Supabase client not available');
            }
            const { data: mediaItem, error: fetchError } = await supabase
                .from('media')
                .select('*')
                .eq('id', id)
                .single();
            if (fetchError) {
                this.logger.error(`❌ Error fetching media item for deletion:`, fetchError);
                throw fetchError;
            }
            if (mediaItem && mediaItem.storage_path) {
                try {
                    await this.deleteFromSupabaseStorage(mediaItem.storage_path);
                    this.logger.log(`✅ File deleted from Supabase Storage: ${mediaItem.storage_path}`);
                }
                catch (storageError) {
                    this.logger.warn(`⚠️ Failed to delete from Supabase Storage: ${storageError.message}`);
                }
            }
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
            const deletedMediaItem = {
                id: result.id,
                name: result.name,
                driveId: result.drive_id,
                mimeType: result.mime_type,
                storageType: result.storage_type,
                createdAt: result.created_at,
            };
            if (result.storage_path) {
                deletedMediaItem.url = this.getSupabaseStorageUrl(result.storage_path);
            }
            return deletedMediaItem;
        }
        catch (error) {
            this.logger.error(`❌ Error deleting media ${id}:`, error);
            throw error;
        }
    }
    async deleteFromSupabaseStorage(storagePath) {
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
        }
        catch (error) {
            this.logger.error(`❌ Error deleting from Supabase Storage:`, error);
            throw error;
        }
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], MediaService);
//# sourceMappingURL=media.service.js.map