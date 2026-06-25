import { cloudinaryConfig } from '../config/cloudinary.config';

type UploadResult = {
  success: boolean;
  data?: {
    url: string;
    publicId: string;
    secureUrl: string;
    width?: number;
    height?: number;
    resourceType: string;
    format: string;
    bytes: number;
  };
  error?: string;
};

export class CloudinaryService {
  private cloudName = cloudinaryConfig.cloudName;
  private uploadPreset = cloudinaryConfig.uploadPreset;

  /** Upload an image file to Cloudinary */
  async uploadImage(
    file: File,
    folder = 'redemption-os/images',
    options?: { tags?: string[]; publicId?: string }
  ): Promise<UploadResult> {
    return this._upload(file, 'image', folder, options);
  }

  /** Upload a video file to Cloudinary */
  async uploadVideo(
    file: File,
    folder = 'redemption-os/videos',
    options?: { tags?: string[] }
  ): Promise<UploadResult> {
    return this._upload(file, 'video', folder, options);
  }

  /** Upload any file (auto-detect type) */
  async uploadFile(
    file: File,
    folder = 'redemption-os/files',
    options?: { tags?: string[] }
  ): Promise<UploadResult> {
    return this._upload(file, 'auto', folder, options);
  }

  /** Upload multiple images in parallel */
  async uploadMultipleImages(
    files: File[],
    folder = 'redemption-os/images',
    options?: { tags?: string[] }
  ): Promise<{ success: boolean; data?: UploadResult['data'][]; error?: string }> {
    try {
      const results = await Promise.all(files.map((f) => this.uploadImage(f, folder, options)));
      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        return { success: false, error: `${failed.length} of ${files.length} uploads failed` };
      }
      return { success: true, data: results.map((r) => r.data!) };
    } catch (err: any) {
      return { success: false, error: err.message ?? 'Multiple upload failed' };
    }
  }

  /** Build an optimized URL from a public ID */
  getOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'scale' | 'thumb';
      quality?: number | 'auto';
      format?: string;
    }
  ): string {
    const t: string[] = [];
    if (options?.width) t.push(`w_${options.width}`);
    if (options?.height) t.push(`h_${options.height}`);
    if (options?.crop) t.push(`c_${options.crop}`);
    if (options?.quality) t.push(`q_${options.quality}`);
    if (options?.format) t.push(`f_${options.format}`);
    const transform = t.length ? `${t.join(',')}/` : '';
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transform}${publicId}`;
  }

  /** Get a square thumbnail URL */
  getThumbnailUrl(publicId: string, size = 150): string {
    return this.getOptimizedUrl(publicId, { width: size, height: size, crop: 'thumb', quality: 80 });
  }

  // ─── Internal helpers ────────────────────────────────────────────────────────

  private async _upload(
    file: File,
    resourceType: 'image' | 'video' | 'auto',
    folder: string,
    options?: { tags?: string[]; publicId?: string }
  ): Promise<UploadResult> {
    try {
      if (!this.cloudName || !this.uploadPreset) {
        throw new Error('Cloudinary is not configured. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
      }

      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', this.uploadPreset);
      form.append('folder', folder);
      if (options?.tags?.length) form.append('tags', options.tags.join(','));
      if (options?.publicId) form.append('public_id', options.publicId);

      const endpoint = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;
      const res = await fetch(endpoint, { method: 'POST', body: form });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `Upload failed: ${res.statusText}`);
      }

      const d = await res.json();
      return {
        success: true,
        data: {
          url: d.url,
          publicId: d.public_id,
          secureUrl: d.secure_url,
          width: d.width,
          height: d.height,
          resourceType: d.resource_type,
          format: d.format,
          bytes: d.bytes,
        },
      };
    } catch (err: any) {
      console.error('[Cloudinary] upload error:', err);
      return { success: false, error: err.message ?? 'Upload failed' };
    }
  }
}

export const cloudinaryService = new CloudinaryService();
