import { cloudinaryConfig } from '../config/cloudinary.config';

export class CloudinaryService {
  private cloudName = cloudinaryConfig.cloudName;
  private uploadPreset = cloudinaryConfig.uploadPreset;

  async uploadImage(
    file: File,
    folder: string = 'redemption-os',
    options?: {
      transformation?: string;
      tags?: string[];
      publicId?: string;
    }
  ): Promise<{
    success: boolean;
    data?: {
      url: string;
      publicId: string;
      secureUrl: string;
      width: number;
      height: number;
    };
    error?: any;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', folder);

      if (options?.tags) {
        formData.append('tags', options.tags.join(','));
      }

      if (options?.publicId) {
        formData.append('public_id', options.publicId);
      }

      if (options?.transformation) {
        formData.append('transformation', options.transformation);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          url: data.url,
          publicId: data.public_id,
          secureUrl: data.secure_url,
          width: data.width,
          height: data.height,
        },
      };
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  async uploadMultipleImages(
    files: File[],
    folder: string = 'redemption-os',
    options?: {
      transformation?: string;
      tags?: string[];
    }
  ): Promise<{
    success: boolean;
    data?: Array<{
      url: string;
      publicId: string;
      secureUrl: string;
      width: number;
      height: number;
    }>;
    error?: any;
  }> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadImage(file, folder, options)
      );

      const results = await Promise.all(uploadPromises);

      const failedUploads = results.filter((result) => !result.success);
      if (failedUploads.length > 0) {
        throw new Error(`${failedUploads.length} uploads failed`);
      }

      const data = results.map((result) => result.data!);

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error('Cloudinary multiple upload error:', error);
      return {
        success: false,
        error: error.message || 'Multiple upload failed',
      };
    }
  }

  getOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'scale' | 'thumb';
      quality?: number;
      format?: string;
    }
  ): string {
    const transformations: string[] = [];

    if (options?.width) transformations.push(`w_${options.width}`);
    if (options?.height) transformations.push(`h_${options.height}`);
    if (options?.crop) transformations.push(`c_${options.crop}`);
    if (options?.quality) transformations.push(`q_${options.quality}`);
    if (options?.format) transformations.push(`f_${options.format}`);

    const transformation = transformations.length > 0 ? transformations.join(',') : '';

    return transformation
      ? `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformation}/${publicId}`
      : `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`;
  }

  getThumbnailUrl(publicId: string, size: number = 150): string {
    return this.getOptimizedUrl(publicId, {
      width: size,
      height: size,
      crop: 'thumb',
      quality: 80,
    });
  }
}

export const cloudinaryService = new CloudinaryService();
