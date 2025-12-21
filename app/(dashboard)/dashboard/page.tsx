'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { DashboardSkeleton } from '@/components/ui/skeleton';

interface Application {
    _id: string;
    jobTitle: string;
    companyName: string;
    status: 'draft' | 'generated' | 'failed';
    createdAt: string;
}

export default function DashboardPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await fetch('/api/applications');
            if (!response.ok) throw new Error('Failed to fetch applications');
            const data = await response.json();
            setApplications(data);
        } catch (error) {
            toast.error('Could not load applications');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        if (!confirm('Are you sure you want to delete this application?')) return;

        try {
            const response = await fetch(`/api/applications/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            setApplications(applications.filter(app => app._id !== id));
            toast.success('Application deleted');
        } catch (error) {
            toast.error('Failed to delete application');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Manage your job applications</p>
                </div>
                <Link href="/applications/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Application
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <DashboardSkeleton />
            ) : applications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-500 mb-6">Start by creating your first AI-tailored application.</p>
                    <Link href="/applications/new">
                        <Button>Create Application</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {applications.map((app) => (
                        <Link
                            key={app._id}
                            href={`/applications/${app._id}`}
                            className="block group"
                        >
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${app.status === 'generated' ? 'bg-green-100 text-green-700' :
                                        app.status === 'failed' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                    {app.jobTitle}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">{app.companyName}</p>

                                <div className="flex justify-between items-center text-xs text-gray-400 pt-4 border-t border-gray-100">
                                    <span>{formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
                                    <button
                                        onClick={(e) => handleDelete(app._id, e)}
                                        className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
