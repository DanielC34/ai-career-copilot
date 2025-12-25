'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Resume {
    _id: string;
    fileName: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
    publicUrl?: string;
    processed: boolean;
}

interface ResumeSelectorProps {
    onSelect?: (resume: Resume) => void;
}

export default function ResumeSelector({ onSelect }: ResumeSelectorProps) {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const response = await fetch('/api/resumes');
            if (!response.ok) throw new Error('Failed to fetch resumes');

            const data = await response.json();
            setResumes(data.resumes || []);
        } catch (error) {
            toast.error('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (resume: Resume) => {
        setSelectedId(resume._id);
        if (onSelect) {
            onSelect(resume);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (resumes.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
                <p className="text-sm text-gray-500">
                    Upload your first resume to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
                Select from your uploaded resumes ({resumes.length})
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {resumes.map((resume) => (
                    <div
                        key={resume._id}
                        className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${selectedId === resume._id
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        onClick={() => handleSelect(resume)}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${selectedId === resume._id ? 'bg-blue-100' : 'bg-gray-100'
                                }`}>
                                <FileText className={`h-5 w-5 ${selectedId === resume._id ? 'text-blue-600' : 'text-gray-600'
                                    }`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate text-sm">
                                    {resume.fileName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {(resume.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                                    <Calendar className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(resume.uploadedAt), { addSuffix: true })}
                                </div>
                            </div>
                        </div>

                        {selectedId === resume._id && (
                            <div className="absolute top-2 right-2">
                                <div className="bg-blue-600 text-white rounded-full p-1">
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedId && (
                <Button
                    onClick={() => {
                        const selected = resumes.find(r => r._id === selectedId);
                        if (selected && onSelect) {
                            onSelect(selected);
                            toast.success('Resume selected');
                        }
                    }}
                    className="w-full mt-4"
                >
                    Use Selected Resume
                </Button>
            )}
        </div>
    );
}
