/**
 * Type definitions for Resume uploads and Supabase Storage
 */

export type AllowedMime = 'application/pdf' | 'application/msword' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export interface ResumeMeta {
    _id?: string;
    userId: string;
    fileName: string;
    storagePath: string;
    publicUrl?: string;
    size: number;
    mimeType: AllowedMime;
    uploadedAt: Date;
    extractedText?: string | null;
    processed: boolean;
}

export interface UploadResponse {
    success: boolean;
    fileId?: string;
    url?: string;
    error?: string;
}
