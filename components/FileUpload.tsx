'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { supabaseClient, STORAGE_BUCKET } from '@/lib/supabase';

interface FileUploadProps {
    onUploadComplete?: (fileId: string, storagePath: string, fileName: string) => void;
    maxSizeMB?: number;
}

export default function FileUpload({ onUploadComplete, maxSizeMB = 10 }: FileUploadProps) {
    const { data: session } = useSession();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = maxSizeMB * 1024 * 1024;

    const validateFile = (file: File): { valid: boolean; error?: string } => {
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Invalid file type. Only PDF, DOC, and DOCX are allowed.' };
        }
        if (file.size > maxSize) {
            return { valid: false, error: `File too large. Maximum size is ${maxSizeMB}MB.` };
        }
        return { valid: true };
    };

    const handleFile = (selectedFile: File) => {
        const validation = validateFile(selectedFile);
        if (!validation.valid) {
            toast.error(validation.error || 'Invalid file');
            return;
        }
        setFile(selectedFile);
        setUploadComplete(false);
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    /**
     * STEP 2 Implementation: Direct Frontend Upload to Supabase
     */
    const uploadFile = async () => {
        if (!file || !session?.user) {
            toast.error('Please sign in to upload files');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // 1. Get a Signed Upload URL from our backend
            // This token allows us to bypass RLS for this specific file path.
            console.log('[FileUpload] Requesting signed upload URL...');
            const signResponse = await fetch('/api/upload/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type
                })
            });

            if (!signResponse.ok) {
                const errorData = await signResponse.json();
                throw new Error(errorData.error || 'Failed to generate upload permission');
            }

            const { token, path, storagePath: finalPath } = await signResponse.json();
            console.log('[FileUpload] Permission granted. Path:', finalPath);

            // 2. Upload directly to Supabase using the Token
            // This bypasses the need for global "Public Write" policies.
            setUploadProgress(30);

            const { data, error } = await supabaseClient.storage
                .from(STORAGE_BUCKET)
                .uploadToSignedUrl(path, token, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('[FileUpload] Supabase upload error:', error);
                throw new Error('Storage error: ' + error.message);
            }

            setUploadProgress(70);

            // 3. Backend Handoff (Step 3)
            // We tell our database that the file exists in Supabase.
            // We only send the path and metadata - NEVER the raw file.
            console.log('[FileUpload] Starting backend handoff...');

            const handoffResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storagePath: data.path,
                    fileName: file.name,
                    size: file.size,
                    mimeType: file.type,
                }),
            });

            if (!handoffResponse.ok) {
                const errorData = await handoffResponse.json();
                throw new Error(errorData.error || 'Failed to sync with backend');
            }

            const handoffData = await handoffResponse.json();
            console.log('[FileUpload] Backend handoff success:', handoffData);

            // 4. Finalize
            setUploadComplete(true);
            toast.success('Resume processed successfully!');

            if (onUploadComplete) {
                // Return the fileId (MongoDB ID) and the storage path
                onUploadComplete(handoffData.fileId, handoffData.storagePath || data.path, file.name);
            }
        } catch (error: any) {
            console.error('[FileUpload] Upload sequence failed:', error);
            toast.error(error.message || 'Failed to process resume');
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setUploadProgress(0);
        setUploadComplete(false);
    };

    return (
        <div className="w-full">
            {!file ? (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleChange}
                    />

                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Upload your resume
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Drag and drop your file here, or click to browse
                    </p>
                    <label htmlFor="file-upload">
                        <Button type="button" variant="outline" asChild>
                            <span className="cursor-pointer">Browse Files</span>
                        </Button>
                    </label>
                    <p className="text-xs text-gray-400 mt-4">
                        Supported formats: PDF, DOC, DOCX (Max {maxSizeMB}MB)
                    </p>
                </div>
            ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${uploadComplete ? 'bg-green-50' : 'bg-blue-50'}`}>
                            {uploadComplete ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                                <FileText className="h-6 w-6 text-blue-600" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>

                            {uploading && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Uploading... {uploadProgress}%
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {uploadComplete && (
                                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Upload complete
                                </p>
                            )}
                        </div>

                        {!uploading && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={removeFile}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    {!uploading && !uploadComplete && (
                        <div className="mt-4 flex gap-2">
                            <Button onClick={uploadFile} className="flex-1">
                                Upload Resume
                            </Button>
                            <Button variant="outline" onClick={removeFile}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
