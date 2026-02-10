import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private drive: any;

  constructor(private configService: ConfigService) {
    this.initializeDrive();
  }

  private initializeDrive() {
    try {
      // Use service account with proper configuration
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: this.configService.get('GOOGLE_CLIENT_EMAIL'),
          private_key: this.configService.get('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        },
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.appdata'
        ],
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.logger.log('Google Drive service initialized with service account');
    } catch (error) {
      this.logger.error('Failed to initialize Google Drive service', error);
    }
  }

  async createFolderStructure(): Promise<void> {
    const rootFolderId = this.configService.get('GOOGLE_DRIVE_ROOT_FOLDER_ID');
    if (!rootFolderId) {
      this.logger.warn('GOOGLE_DRIVE_ROOT_FOLDER_ID not configured');
      return;
    }

    const folders = [
      'hero',
      'events',
      'events/gallery',
      'programs',
      'mentor-talks',
      'team',
      'founders',
      'testimonials',
      'uploads'
    ];

    for (const folderPath of folders) {
      await this.createFolderIfNeeded(rootFolderId, folderPath);
    }
  }

  private async createFolderIfNeeded(parentId: string, folderPath: string): Promise<string> {
    const folderNames = folderPath.split('/');
    let currentParentId = parentId;

    for (const folderName of folderNames) {
      const existingFolder = await this.findFolder(currentParentId, folderName);
      
      if (existingFolder) {
        currentParentId = existingFolder.id;
      } else {
        const newFolder = await this.createFolder(currentParentId, folderName);
        currentParentId = newFolder.id;
        this.logger.log(`Created folder: ${folderPath}`);
      }
    }

    return currentParentId;
  }

  private async findFolder(parentId: string, name: string): Promise<any> {
    try {
      const response = await this.drive.files.list({
        q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });
      return response.data.files[0];
    } catch (error) {
      this.logger.error(`Error finding folder ${name}`, error);
      return null;
    }
  }

  private async createFolder(parentId: string, name: string): Promise<any> {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        },
        fields: 'id, name',
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating folder ${name}`, error);
      throw error;
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folderPath: string,
    mimeType: string
  ): Promise<{ url: string; fileId: string }> {
    try {
      // Check if shared drive ID is configured
      const sharedDriveId = this.configService.get('GOOGLE_SHARED_DRIVE_ID');
      
      if (sharedDriveId) {
        // Upload to Shared Drive
        return await this.uploadToSharedDrive(fileBuffer, fileName, folderPath, mimeType, sharedDriveId);
      } else {
        // Fallback to personal drive (may have quota limitations)
        return await this.uploadToPersonalDrive(fileBuffer, fileName, folderPath, mimeType);
      }
    } catch (error) {
      this.logger.error(`Error uploading file ${fileName}`, error);
      
      // Handle quota exceeded errors specifically
      if (error.code === 403 && error.errors?.[0]?.reason === 'storageQuotaExceeded') {
        this.logger.error('Storage quota exceeded. Ensure service account has access to a Shared Drive with storage allocation.');
        throw new Error('Google Drive storage quota exceeded. Please configure a Shared Drive for the service account.');
      }
      
      throw error;
    }
  }

  private async uploadToSharedDrive(
    fileBuffer: Buffer,
    fileName: string,
    folderPath: string,
    mimeType: string,
    sharedDriveId: string
  ): Promise<{ url: string; fileId: string }> {
    // Create folder structure in Shared Drive
    const targetFolderId = await this.createFolderInSharedDrive(sharedDriveId, folderPath);

    // Upload file to Shared Drive
    const media = {
      mimeType,
      body: Readable.from(fileBuffer),
    };

    const response = await this.drive.files.create({
      requestBody: {
        name: fileName,
        parents: [targetFolderId],
        driveId: sharedDriveId,
        corpora: 'drive',
      },
      media,
      fields: 'id',
      supportsAllDrives: true,
    });

    // Make file publicly accessible in Shared Drive
    await this.makeFilePublic(response.data.id, true);

    const fileId = response.data.id;
    const publicUrl = `https://drive.google.com/uc?id=${fileId}`;

    return {
      url: publicUrl,
      fileId,
    };
  }

  private async uploadToPersonalDrive(
    fileBuffer: Buffer,
    fileName: string,
    folderPath: string,
    mimeType: string
  ): Promise<{ url: string; fileId: string }> {
    const rootFolderId = this.configService.get('GOOGLE_DRIVE_ROOT_FOLDER_ID');
    if (!rootFolderId) {
      throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID not configured');
    }

    // Get or create the target folder
    const targetFolderId = await this.createFolderIfNeeded(rootFolderId, folderPath);

    // Upload file
    const media = {
      mimeType,
      body: Readable.from(fileBuffer),
    };

    const response = await this.drive.files.create({
      requestBody: {
        name: fileName,
        parents: [targetFolderId],
      },
      media,
      fields: 'id',
    });

    // Make file publicly accessible
    await this.makeFilePublic(response.data.id);

    const fileId = response.data.id;
    const publicUrl = `https://drive.google.com/uc?id=${fileId}`;

    return {
      url: publicUrl,
      fileId,
    };
  }

  private async createFolderInSharedDrive(sharedDriveId: string, folderPath: string): Promise<string> {
    const folderNames = folderPath.split('/');
    let currentParentId = sharedDriveId;

    for (const folderName of folderNames) {
      const existingFolder = await this.findFolderInSharedDrive(sharedDriveId, currentParentId, folderName);
      
      if (existingFolder) {
        currentParentId = existingFolder.id;
      } else {
        const newFolder = await this.createFolderInSharedDriveInternal(sharedDriveId, currentParentId, folderName);
        currentParentId = newFolder.id;
        this.logger.log(`Created folder in Shared Drive: ${folderPath}`);
      }
    }

    return currentParentId;
  }

  private async findFolderInSharedDrive(driveId: string, parentId: string, name: string): Promise<any> {
    try {
      const response = await this.drive.files.list({
        q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        corpora: 'drive',
        driveId: driveId,
      });
      return response.data.files[0];
    } catch (error) {
      this.logger.error(`Error finding folder ${name} in Shared Drive`, error);
      return null;
    }
  }

  private async createFolderInSharedDriveInternal(driveId: string, parentId: string, name: string): Promise<any> {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
          driveId: driveId,
        },
        fields: 'id, name',
        supportsAllDrives: true,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating folder ${name} in Shared Drive`, error);
      throw error;
    }
  }

  private async makeFilePublic(fileId: string, isSharedDrive: boolean = false): Promise<void> {
    try {
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
        supportsAllDrives: isSharedDrive,
      });
    } catch (error) {
      this.logger.error(`Error making file public ${fileId}`, error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId,
      });
      this.logger.log(`Deleted file: ${fileId}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${fileId}`, error);
      throw error;
    }
  }

  getFileUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}`;
  }
}