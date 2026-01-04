'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Trash2, Plus, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Resume {
    _id: string;
    fileName: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
    publicUrl?: string;
    processed: boolean;
}

export default function ResumesPage() {
    const router = useRouter();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id: string, fileName: string) => {
        if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

        try {
            const response = await fetch(`/api/resumes/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete resume');
            }

            toast.success('Resume deleted successfully');
            // Refresh the list
            setResumes(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete resume');
        }
    };

    const getFileIcon = (mimeType: string) => {
        return <FileText className="h-6 w-6" />;
    };

    const getFileTypeLabel = (mimeType: string) => {
        if (mimeType === 'application/pdf') return 'PDF';
        if (mimeType === 'application/msword') return 'DOC';
        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
        return 'File';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Resume Library</h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage your uploaded resumes</p>
                </div>
                <Link href="/applications/new">
                    <Button size="sm" className="sm:size-default">
                        <Plus className="w-4 h-4 mr-2" />
                        New Application
                    </Button>
                </Link>
            </div>


            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-gray-100 rounded-lg animate-pulse w-12 h-12" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                                </div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3 mb-4" />
                            <div className="flex gap-2">
                                <div className="h-9 bg-gray-200 rounded animate-pulse flex-1" />
                                <div className="h-9 bg-gray-200 rounded animate-pulse w-9" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : resumes.length === 0 ? (

                <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
                    <p className="text-gray-500 mb-6">Upload your first resume to get started.</p>
                    <Link href="/applications/new">
                        <Button>Upload Resume</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {resumes.map((resume) => (
                        <div
                            key={resume._id}
                            className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
                        >
                            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg flex-shrink-0">
                                    {getFileIcon(resume.mimeType)}
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words line-clamp-2 mb-1" title={resume.fileName}>
                                        {resume.fileName}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-500">
                                        <span className="px-2 py-0.5 sm:py-1 bg-gray-100 rounded">
                                            {getFileTypeLabel(resume.mimeType)}
                                        </span>
                                        <span>{(resume.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-400 mb-3 sm:mb-4">
                                Uploaded {formatDistanceToNow(new Date(resume.uploadedAt), { addSuffix: true })}
                            </div>

                            <div className="flex gap-2">
                                {resume.publicUrl && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-xs sm:text-sm"
                                        onClick={() => window.open(resume.publicUrl, '_blank')}
                                    >
                                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        View
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(resume._id, resume.fileName)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
