/**
 * Resume Upload Component
 * 
 * Handles the canonical multi-step resume creation flow:
 * 1. Storage Upload (Direct to Supabase)
 * 2. Resume Record Creation (Canonical Backend Handoff)
 * 3. Intelligence Pipeline Trigger (/api/resumes/[id]/process)
 * 4. Polling for Completion
 */

import React, { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
    Upload,
    File as FileIcon,
    CheckCircle2,
    AlertCircle,
    X,
    Loader2,
    Search,
    Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'react-hot-toast';
import { supabaseClient, STORAGE_BUCKET } from '@/lib/supabase';
import { ATS_TEMPLATES } from '@/lib/ats-templates';
import type { ATSAnalysis } from '@/types/resume';

interface ResumeUploadProps {
    onResumeCreated?: (resumeId: string, storagePath: string, fileName: string) => void;
    onProcessComplete?: (resumeId: string, analysis: ATSAnalysis | null) => void;
    maxSizeMB?: number;
}

export default function ResumeUpload({ onResumeCreated, onProcessComplete, maxSizeMB = 10 }: ResumeUploadProps) {
    const { data: session } = useSession();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [processComplete, setProcessComplete] = useState(false);
    const [processError, setProcessError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const [selectedTemplate, setSelectedTemplate] = useState('modern-clean');

    /**
     * Safely parse JSON or return verbose error if it's HTML/unexpected
     */
    const safeJson = async (response: Response) => {
        const contentType = response.headers.get('content-type');
        const text = await response.text();

        if (!contentType || !contentType.includes('application/json')) {
            console.error('[ResumeUpload] NON-JSON Response received:', {
                status: response.status,
                contentType,
                preview: text.substring(0, 500)
            });
            throw new Error(`Server returned non-JSON response (${response.status}). Stage: ${processing ? 'Processing' : 'Pre-upload'}`);
        }

        try {
            return JSON.parse(text);
        } catch (err) {
            console.error('[ResumeUpload] JSON Parse Error. Raw response:', text.substring(0, 500));
            throw new Error(`Failed to parse server response. Stage: ${processing ? 'Processing' : 'Pre-upload'}`);
        }
    };

    /**
     * == NEW WORKFLOW ==
     * Polling mechanism to check resume status
     */
    const pollStatus = async (id: string) => {
        const maxAttempts = 45; // Increased for Gemini retries
        let attempts = 0;

        const interval = setInterval(async () => {
            attempts++;
            try {
                const response = await fetch(`/api/resumes/${id}`);
                const data = await safeJson(response);
                if (!response.ok) throw new Error(data.error || 'Failed to fetch status');

                const resume = data.resume;
                if (resume.status === 'completed') {
                    clearInterval(interval);
                    setAnalysis(resume.analysis || null);
                    setProcessComplete(true);
                    setProcessing(false);
                    toast.success('Resume analyzed successfully!');
                    if (onProcessComplete) onProcessComplete(id, resume.analysis || null);
                } else if (resume.status === 'failed') {
                    clearInterval(interval);
                    setProcessError(resume.lastError || 'AI mapping failed. Check logs for details.');
                    setProcessing(false);
                }
            } catch (err: any) {
                console.error('[Polling Error]', err);
                // Don't clear interval immediately on transient network errors
            }

            if (attempts >= maxAttempts) {
                clearInterval(interval);
                setProcessError('Analysis is taking longer than expected. You can check it later in your library.');
                setProcessing(false);
            }
        }, 3000); // 3s polling
    };

    /**
     * == NEW WORKFLOW ==
     * Step 3: Trigger Template-Guided Resume Intelligence
     */
    const triggerProcessing = async (id: string, templateId: string) => {
        setProcessing(true);
        setProcessError(null);
        logStage('AI Structuring', `Starting with template: ${templateId}`);

        try {
            const response = await fetch(`/api/resumes/${id}/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedTemplate: templateId })
            });

            const data = await safeJson(response);

            if (!response.ok) {
                const stageInfo = data.stage ? ` [${data.stage}]` : '';
                throw new Error(`${data.error || 'Processing initialization failed'}${stageInfo}: ${data.message || ''}`);
            }

            pollStatus(id);
        } catch (error: any) {
            console.error('[ResumeUpload] Processing trigger failed:', error);
            setProcessError(error.message);
            setProcessing(false);
            toast.error('Failed to start resume analysis');
        }
    };

    const logStage = (stage: string, message: string) => {
        console.log(`[ResumeUpload][STAGE: ${stage}] ${message}`);
    };

    /* === OLD WORKFLOW (COMMENTED OUT) ===
    const pollStatusOld = async (id: string) => {
        const maxAttempts = 30;
        let attempts = 0;

        const interval = setInterval(async () => {
            attempts++;
            try {
                const response = await fetch(`/api/resumes/${id}`);
                const data = await safeJson(response);

                if (!response.ok) throw new Error(data.error || 'Failed to fetch status');

                const resume = data.resume;

                if (resume.status === 'completed') {
                    clearInterval(interval);
                    setAnalysis(resume.analysis || null);
                    setProcessComplete(true);
                    setProcessing(false);
                    toast.success('Resume analyzed successfully!');
                    if (onProcessComplete) {
                        onProcessComplete(id, resume.analysis || null);
                    }
                } else if (resume.status === 'failed') {
                    clearInterval(interval);
                    setProcessError('AI analysis failed. Please try again.');
                    setProcessing(false);
                }
            } catch (err) {
                console.error('[Polling Error]', err);
            }

            if (attempts >= maxAttempts) {
                clearInterval(interval);
                setProcessError('Analysis is taking longer than expected. You can check it later in your library.');
                setProcessing(false);
            }
        }, 2000);
    };

    const triggerProcessingOld = async (id: string) => {
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
            pollStatusOld(id);
        } catch (error: any) {
            console.error('[ResumeUpload] Processing trigger failed:', error);
            setProcessError(error.message);
            setProcessing(false);
            toast.error('Failed to start resume analysis');
        }
    };
    === END OLD WORKFLOW === */

    /**
     * Step 1 & 2: Create Resume From Upload
     */
    const createResumeFromUpload = async () => {
        if (!file || !session?.user) {
            toast.error('Please sign in to upload resumes');
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`File size exceeds ${maxSizeMB}MB limit`);
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
            if (!signResponse.ok) throw new Error(signData.error || 'Failed to generate upload permission');

            const { token, path } = signData;

            // 2. Upload directly to Supabase Storage
            setUploadProgress(30);
            const { data, error } = await supabaseClient.storage
                .from(STORAGE_BUCKET)
                .uploadToSignedUrl(path, token, file, { upsert: false });

            if (error) throw new Error('Storage error: ' + error.message);
            setUploadProgress(70);

            // 3. Canonical Resume Creation (Backend Handoff)
            const creationResponse = await fetch('/api/resumes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: 'upload',
                    storagePath: data.path,
                    fileName: file.name,
                    size: file.size,
                    mimeType: file.type,
                }),
            });

            const creationData = await safeJson(creationResponse);
            if (!creationResponse.ok) throw new Error(creationData.error || 'Failed to create resume record');

            const newResumeId = creationData.resumeId;
            setResumeId(newResumeId);
            setUploadProgress(100);
            setUploadComplete(true);

            if (onResumeCreated) {
                onResumeCreated(newResumeId, data.path, file.name);
            }

            // 4. Trigger Async Processing
            await triggerProcessing(newResumeId, selectedTemplate);

        } catch (error: any) {
            console.error('[ResumeUpload] Flow failed:', error);
            setUploadProgress(0);
            toast.error(error.message || 'Error creating resume');
        } finally {
            setUploading(false);
        }
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
            setFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setUploadComplete(false);
        setResumeId(null);
        setAnalysis(null);
        setProcessComplete(false);
        setProcessError(null);
    };

    return (
        <div className="w-full">
            {!file ? (
                <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer group relative ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept=".pdf,.doc,.docx"
                    />
                    <div className="flex flex-col items-center">
                        <Upload className={`h-12 w-12 mb-4 transition-colors ${dragActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'
                            }`} />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Upload your resume</h3>
                        <p className="text-sm text-gray-500 mb-4">PDF, DOC, or DOCX up to {maxSizeMB}MB</p>
                        <Button variant="outline" className="group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            Select File
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                <FileIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-md">
                                    {file.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        {!uploading && !processing && !uploadComplete && (
                            <button
                                onClick={handleRemoveFile}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* Template Selection */}
                    {!uploading && !uploadComplete && !processComplete && (
                        <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <label className="text-sm font-semibold text-gray-700 mb-3 block">
                                Choose ATS Optimization Template
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {ATS_TEMPLATES.map((tmpl) => (
                                    <button
                                        key={tmpl.id}
                                        onClick={() => setSelectedTemplate(tmpl.id)}
                                        className={`flex flex-col items-start p-3 rounded-lg border-2 text-left transition-all ${selectedTemplate === tmpl.id
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-1">
                                            <span className={`text-sm font-bold ${selectedTemplate === tmpl.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                                {tmpl.name}
                                            </span>
                                            {selectedTemplate === tmpl.id && (
                                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-500 line-clamp-2">
                                            {tmpl.description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress States */}
                    {(uploading || processing || uploadComplete) && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    {uploadComplete ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                    )}
                                    <span className={uploadComplete ? "text-green-600 font-medium" : "text-gray-600"}>
                                        {uploadComplete ? 'Upload Successful' : 'Uploading to secure storage...'}
                                    </span>
                                </div>
                                {!uploadComplete && <span className="text-gray-500">{uploadProgress}%</span>}
                            </div>
                            <Progress value={uploadProgress} className="h-2" />

                            {uploadComplete && (
                                <div className="flex flex-col gap-3 pt-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        {processComplete ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : processError ? (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        ) : (
                                            <Brain className="h-4 w-4 text-purple-500 animate-pulse" />
                                        )}
                                        <span className={processComplete ? "text-green-600 font-medium" : processError ? "text-red-600" : "text-gray-600"}>
                                            {processComplete
                                                ? 'AI Analysis Complete'
                                                : processError
                                                    ? 'Analysis Failed'
                                                    : 'Gemini AI is structuring your resume...'}
                                        </span>
                                    </div>

                                    {processError && (
                                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold mb-1">Wait, something went wrong:</p>
                                                <p>{processError}</p>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto text-xs text-red-700 font-bold underline mt-2"
                                                    onClick={() => triggerProcessing(resumeId!, selectedTemplate)}
                                                >
                                                    Click here to retry analysis
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {processComplete && analysis && (
                                        <div className="bg-green-50 rounded-lg p-4 border border-green-100 mb-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-green-800">ATS Snapshot</span>
                                                <span className="text-lg font-bold text-green-700">{analysis.score}%</span>
                                            </div>
                                            <div className="text-xs text-green-700 line-clamp-2">
                                                Recommendations: {analysis.recommendations[0]}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {!uploading && !uploadComplete && !processError && (
                        <Button
                            onClick={createResumeFromUpload}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            Confirm & Upload
                            <Search className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
