'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, Download, ArrowLeft, RefreshCw, FileDown, FileText, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { exportCVAsPDF, exportCoverLetterAsPDF, exportCompletePackageAsPDF } from '@/lib/pdfExport';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GeneratedContent {
    rewrittenCV: string;
    coverLetter: string;
    skillsMatch: string[];
    skillsGap: string[];
    interviewQuestions: string[];
    summary: string;
}

interface Application {
    _id: string;
    jobTitle: string;
    companyName: string;
    status: 'draft' | 'generated' | 'failed';
    generatedContent?: GeneratedContent;
}

export default function ApplicationResults() {
    const params = useParams();
    const id = params.id as string;

    const [application, setApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('cv');

    useEffect(() => {
        if (id) fetchApplication();
    }, [id]);

    const fetchApplication = async () => {
        try {
            const response = await fetch(`/api/applications/${id}`);
            if (!response.ok) throw new Error('Failed to load application');
            const data = await response.json();
            setApplication(data);

            // If status is draft, trigger generation automatically
            if (data.status === 'draft' && !isGenerating) {
                generateContent();
            }
        } catch (error) {
            toast.error('Error loading application');
        } finally {
            setIsLoading(false);
        }
    };

    const generateContent = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: id }),
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();
            setApplication(data.application);
            toast.success('Content generated successfully!');
        } catch (error) {
            toast.error('Failed to generate content');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleExportCV = () => {
        if (application?.generatedContent?.rewrittenCV) {
            exportCVAsPDF(
                application.generatedContent.rewrittenCV,
                application.jobTitle,
                application.companyName
            );
            toast.success('CV exported as PDF');
        }
    };

    const handleExportCoverLetter = () => {
        if (application?.generatedContent?.coverLetter) {
            exportCoverLetterAsPDF(
                application.generatedContent.coverLetter,
                application.jobTitle,
                application.companyName
            );
            toast.success('Cover letter exported as PDF');
        }
    };

    const handleExportComplete = () => {
        if (application?.generatedContent) {
            exportCompletePackageAsPDF(
                application.generatedContent,
                application.jobTitle,
                application.companyName
            );
            toast.success('Complete package exported as PDF');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-xl font-semibold mb-4">Application not found</h2>
                <Link href="/dashboard">
                    <Button>Return to Dashboard</Button>
                </Link>
            </div>
        );
    }

    if (isGenerating || application.status === 'draft') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Application</h2>
                <p className="text-gray-600 max-w-md">
                    Gemini is analyzing your CV and the job description to create tailored materials.
                    This usually takes about 10-20 seconds.
                </p>
            </div>
        );
    }

    const content = application.generatedContent;

    if (!content) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">Generation failed or no content available.</p>
                <Button onClick={generateContent}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8 mb-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{application.jobTitle}</h1>
                            <p className="text-sm text-gray-500">{application.companyName}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={generateContent} disabled={isGenerating}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                            Regenerate
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export PDF
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={handleExportCV}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Export CV Only
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportCoverLetter}>
                                    <FileDown className="w-4 h-4 mr-2" />
                                    Export Cover Letter
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportComplete}>
                                    <PackageOpen className="w-4 h-4 mr-2" />
                                    Export Complete Package
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-white border border-gray-200 rounded-lg">
                        <TabsTrigger value="cv" className="py-3">Optimized CV</TabsTrigger>
                        <TabsTrigger value="cover-letter" className="py-3">Cover Letter</TabsTrigger>
                        <TabsTrigger value="skills" className="py-3">Skills Analysis</TabsTrigger>
                        <TabsTrigger value="interview" className="py-3">Interview Prep</TabsTrigger>
                    </TabsList>

                    {/* CV Tab */}
                    <TabsContent value="cv" className="mt-0">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                                <CardTitle>Optimized CV</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(content.rewrittenCV)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="prose max-w-none whitespace-pre-wrap font-mono text-sm">
                                    {content.rewrittenCV}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Cover Letter Tab */}
                    <TabsContent value="cover-letter" className="mt-0">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                                <CardTitle>Cover Letter</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(content.coverLetter)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="prose max-w-none whitespace-pre-wrap">
                                    {content.coverLetter}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Skills Tab */}
                    <TabsContent value="skills" className="mt-0">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-green-700">Matching Skills</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {content.skillsMatch.map((skill, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-amber-700">Skills to Highlight / Missing</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {content.skillsGap.map((skill, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Interview Tab */}
                    <TabsContent value="interview" className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Interview Preparation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {content.interviewQuestions.map((question, i) => (
                                        <li key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <span className="font-semibold text-blue-600 block mb-1">Question {i + 1}</span>
                                            {question}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
