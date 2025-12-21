'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle, RefreshCcw, Award, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { supabaseClient, STORAGE_BUCKET } from '@/lib/supabase';
import type { ResumeMeta, ATSAnalysis } from '@/types/resume';

interface FileUploadProps {
    onUploadComplete?: (fileId: string, storagePath: string, fileName: string) => void;
    onProcessComplete?: (fileId: string, analysis: ATSAnalysis | null) => void;
    maxSizeMB?: number;
}

export default function FileUpload({ onUploadComplete, onProcessComplete, maxSizeMB = 10 }: FileUploadProps) {
    const { data: session } = useSession();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [processComplete, setProcessComplete] = useState(false);
    const [processError, setProcessError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);
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
        setProcessComplete(false);
        setProcessError(null);
        setAnalysis(null);
        setFileId(null);
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
     * Safely parse JSON or return the raw text if it's HTML/invalid
     */
    const safeJson = async (response: Response) => {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (err) {
            console.error('[FileUpload] JSON Parse Error. Raw response:', text.substring(0, 500));
            throw new Error(`Server returned invalid response (possibly HTML/404). Status: ${response.status}`);
        }
    };

    /**
     * Polling mechanism to check resume status
     */
    const pollStatus = async (id: string) => {
        const maxAttempts = 30; // 30 attempts, 2 seconds apart = 1 minute timeout
        let attempts = 0;

        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/resumes/${id}`);
                const data = await safeJson(response);

                if (!response.ok) throw new Error(data.error || 'Failed to fetch status');

                const resume: ResumeMeta = data.resume;

                if (resume.status === 'completed') {
                    setAnalysis(resume.analysis || null);
                    setProcessComplete(true);
                    setProcessing(false);
                    toast.success('Resume analyzed successfully!');
                    if (onProcessComplete) {
                        onProcessComplete(id, resume.analysis || null);
                    }
                    return true;
                } else if (resume.status === 'failed') {
                    setProcessError('AI analysis failed. Please try again.');
                    setProcessing(false);
                    return true;
                }

                return false;
            } catch (err) {
                console.error('[Polling Error]', err);
                return false;
            }
        };

        const interval = setInterval(async () => {
            attempts++;
            const done = await checkStatus();
            if (done || attempts >= maxAttempts) {
                clearInterval(interval);
                if (attempts >= maxAttempts && !done) {
                    setProcessError('Analysis is taking longer than expected. You can check it later in your library.');
                    setProcessing(false);
                }
            }
        }, 2000);
    };

    /**
     * Step 5 Trigger: Start Async Processing
     */
    const triggerProcessing = async (id: string) => {
        setProcessing(true);
        setProcessError(null);

        try {
            const response = await fetch(`/api/resumes/${id}/process`, {
                method: 'POST'
            });

            const data = await safeJson(response);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start processing');
            }

            // Start polling for results
            pollStatus(id);
        } catch (error: any) {
            console.error('[FileUpload] Processing trigger failed:', error);
            setProcessError(error.message);
            setProcessing(false);
            toast.error('Failed to start resume analysis');
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
            // 1. Get a Signed Upload URL
            const signResponse = await fetch('/api/upload/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type
                })
            });

            const signData = await safeJson(signResponse);

            if (!signResponse.ok) {
                throw new Error(signData.error || 'Failed to generate upload permission');
            }

            const { token, path } = signData;

            // 2. Upload directly to Supabase
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

            // 3. Backend Handoff
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

            const handoffData = await safeJson(handoffResponse);

            if (!handoffResponse.ok) {
                throw new Error(handoffData.error || 'Failed to sync with backend');
            }

            setFileId(handoffData.fileId);
            setUploadProgress(100);
            setUploadComplete(true);

            // 4. Trigger Async Processing (Step 5)
            await triggerProcessing(handoffData.fileId);

            if (onUploadComplete) {
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
        setProcessComplete(false);
        setProcessError(null);
        setAnalysis(null);
        setFileId(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {!file ? (
                <div
                    className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${dragActive
                        ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
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

                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Upload your resume
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Drag and drop your file here, or click to browse
                    </p>
                    <label htmlFor="file-upload">
                        <Button type="button" size="lg" className="px-8" asChild>
                            <span className="cursor-pointer">Browse Files</span>
                        </Button>
                    </label>
                    <p className="text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
                        <Info className="h-3 w-3" />
                        Supported: PDF, DOC, DOCX (Max {maxSizeMB}MB)
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${processComplete ? 'bg-green-50' : 'bg-blue-50'}`}>
                                {processComplete ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                ) : (
                                    <FileText className="h-6 w-6 text-blue-600" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-lg truncate">{file.name}</p>
                                <p className="text-sm text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>

                                {/* Progress Bars */}
                                <div className="mt-4 space-y-4">
                                    {uploading && (
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600 flex items-center gap-2">
                                                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                                    Uploading file...
                                                </span>
                                                <span className="font-medium">{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div
                                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {processing && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600 flex items-center gap-2">
                                                    <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                                                    AI is analyzing your resume...
                                                </span>
                                                <span className="text-xs text-gray-400 italic">This usually takes 10-20 seconds</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-purple-600 h-1.5 rounded-full w-full animate-progress-indeterminate" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Results View */}
                                {processComplete && analysis && (
                                    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="flex items-center gap-4 bg-green-50 border border-green-100 p-4 rounded-lg">
                                            <div className="bg-white p-3 rounded-full shadow-sm">
                                                <Award className="h-8 w-8 text-yellow-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-green-800 font-medium">ATS Compatibility Score</p>
                                                <p className="text-3xl font-bold text-green-900">{analysis.score}%</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    Identified Issues
                                                </h4>
                                                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                                                    {analysis.issues.map((issue, i) => (
                                                        <li key={i}>{issue}</li>
                                                    ))}
                                                    {analysis.issues.length === 0 && <li className="text-gray-400 italic">No issues found!</li>}
                                                </ul>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                                    Recommendations
                                                </h4>
                                                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                                                    {analysis.recommendations.map((rec, i) => (
                                                        <li key={i}>{rec}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Error State */}
                                {processError && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm text-red-800 font-medium">{processError}</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileId && triggerProcessing(fileId)}
                                                className="mt-3 text-red-700 border-red-200 hover:bg-red-100"
                                            >
                                                <RefreshCcw className="h-3 w-3 mr-2" />
                                                Retry Analysis
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!uploading && !processing && (
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

                        {!uploading && !processing && !uploadComplete && !processError && (
                            <div className="mt-8 flex gap-3">
                                <Button onClick={uploadFile} className="flex-1 h-11 bg-blue-600 hover:bg-blue-700">
                                    Start Analysis
                                </Button>
                                <Button variant="outline" onClick={removeFile} className="h-11">
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes progress-indeterminate {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-indeterminate {
                    animation: progress-indeterminate 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
}
