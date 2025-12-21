/**
 * Storage Utilities for Supabase Resume Uploads
 * 
 * This module provides helper functions for:
 * - Uploading resumes to Supabase Storage
 * - Generating signed URLs for private files
 * - Deleting files from storage
 * 
 * Note: These functions should primarily be used from API routes,
 * not directly from client components, to maintain security.
 */

import { supabaseServiceClient, STORAGE_BUCKET } from './supabase';
import type { AllowedMime } from '@/types/resume';

/**
 * Allowed MIME types for resume uploads
 */
const ALLOWED_MIME_TYPES: AllowedMime[] = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Maximum file size: 10MB
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMime)) {
        return {
            valid: false,
            error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.',
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: 'File too large. Maximum size is 10MB.',
        };
    }

    return { valid: true };
}

/**
 * Upload a resume file to Supabase Storage
 * 
 * @param file - The File object to upload
 * @param userId - The user's ID (used for folder organization)
 * @returns Object with success status, storage path, and public URL
 */
export async function uploadResume(
    file: File,
    userId: string
): Promise<{ success: boolean; path?: string; url?: string; error?: string }> {
    console.log('[uploadResume] Starting upload process');
    console.log('[uploadResume] File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        userId
    });

    if (!supabaseServiceClient) {
        console.error('[uploadResume] ERROR: Supabase service client not configured');
        return { success: false, error: 'Supabase service client not configured' };
    }

    try {
        // Validate file
        console.log('[uploadResume] Validating file...');
        const validation = validateFile(file);
        if (!validation.valid) {
            console.error('[uploadResume] Validation failed:', validation.error);
            return { success: false, error: validation.error };
        }
        console.log('[uploadResume] File validation passed');

        // Create unique filename with timestamp
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `user_${userId}/${timestamp}_${sanitizedFileName}`;

        console.log('[uploadResume] Storage path:', storagePath);
        console.log('[uploadResume] Bucket name:', STORAGE_BUCKET);

        // Upload to Supabase
        console.log('[uploadResume] Attempting upload to Supabase...');
        const { data, error } = await supabaseServiceClient.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: false, // Don't overwrite existing files
            });

        if (error) {
            console.error('[uploadResume] Supabase upload error:', {
                message: error.message,
                name: error.name,
                statusCode: (error as any).statusCode,
                error: error
            });
            return { success: false, error: error.message };
        }

        console.log('[uploadResume] Upload successful, data:', data);

        // Get public URL (or use signed URL for private buckets)
        console.log('[uploadResume] Getting public URL...');
        const { data: urlData } = supabaseServiceClient.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(data.path);

        console.log('[uploadResume] Public URL generated:', urlData.publicUrl);

        return {
            success: true,
            path: data.path,
            url: urlData.publicUrl,
        };
    } catch (error) {
        console.error('[uploadResume] Unexpected error during upload:');
        console.error('[uploadResume] Error type:', typeof error);
        console.error('[uploadResume] Error name:', (error as any)?.name);
        console.error('[uploadResume] Error message:', (error as any)?.message);
        console.error('[uploadResume] Error stack:', (error as any)?.stack);
        console.error('[uploadResume] Full error object:', error);

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown upload error',
        };
    }
}

/**
 * Generate a signed upload URL for a specific path
 * This allows a client to upload a file directly to a specific path
 * without needing RLS write permissions.
 * 
 * @param path - The storage path where the file will be uploaded
 * @returns Object with token, path, and full URL
 */
export async function createSignedUploadUrl(
    path: string
): Promise<{ token: string; path: string; url: string; error?: string }> {
    if (!supabaseServiceClient) {
        return { token: '', path: '', url: '', error: 'Supabase service client not configured' };
    }

    try {
        const { data, error } = await supabaseServiceClient.storage
            .from(STORAGE_BUCKET)
            .createSignedUploadUrl(path);

        if (error) {
            console.error('Error creating signed upload URL:', error);
            return { token: '', path: '', url: '', error: error.message };
        }

        return {
            token: data.token,
            path: data.path,
            url: data.signedUrl
        };
    } catch (error) {
        console.error('Unexpected error creating signed upload URL:', error);
        return {
            token: '',
            path: '',
            url: '',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Generate a signed URL for a private file
 * Useful if the bucket is private and you need temporary access
 * 
 * @param path - Storage path of the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL or null if error
 */
export async function getSignedUrl(
    path: string,
    expiresIn: number = 3600
): Promise<string | null> {
    if (!supabaseServiceClient) {
        console.error('Supabase service client not configured');
        return null;
    }

    try {
        const { data, error } = await supabaseServiceClient.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(path, expiresIn);

        if (error) {
            console.error('Error creating signed URL:', error);
            return null;
        }

        return data.signedUrl;
    } catch (error) {
        console.error('Signed URL error:', error);
        return null;
    }
}

/**
 * Download a resume file from Supabase Storage
 * 
 * @param path - Storage path of the file to download
 * @returns File blob or null if error
 */
export async function downloadResume(
    path: string
): Promise<Blob | null> {
    if (!supabaseServiceClient) {
        console.error('Supabase service client not configured');
        return null;
    }

    try {
        const { data, error } = await supabaseServiceClient.storage
            .from(STORAGE_BUCKET)
            .download(path);

        if (error) {
            console.error('Supabase download error:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Download error:', error);
        return null;
    }
}

/**
 * Fetch a resume file and return it as a Buffer (Step 5)
 * Useful for server-side processing like AI or PDF parsing
 * 
 * @param path - Storage path of the file
 * @returns Buffer or null if error
 */
export async function getResumeBuffer(
    path: string
): Promise<Buffer | null> {
    const blob = await downloadResume(path);
    if (!blob) return null;

    try {
        const arrayBuffer = await blob.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error('Error converting blob to buffer:', error);
        return null;
    }
}

/**
 * Delete a resume file from Supabase Storage
 * 
 * @param path - Storage path of the file to delete
 * @returns Success status
 */
export async function deleteResume(
    path: string
): Promise<{ success: boolean; error?: string }> {
    if (!supabaseServiceClient) {
        return { success: false, error: 'Supabase service client not configured' };
    }

    try {
        const { error } = await supabaseServiceClient.storage
            .from(STORAGE_BUCKET)
            .remove([path]);

        if (error) {
            console.error('Supabase delete error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
