"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, FileText, Upload as UploadIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import FileUpload from "@/components/FileUpload";
import ResumeSelector from "@/components/ResumeSelector";

export default function ApplicationGenerator() {
    const router = useRouter();
    const [cvText, setCvText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("upload");
    const [uploadMode, setUploadMode] = useState<"new" | "existing">("new");
    const [isFetchingResume, setIsFetchingResume] = useState(false);

    const handleGenerate = async () => {
        if (!cvText || !jobDescription) {
            toast.error('Please provide both CV and job description');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Create draft application
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalCV: cvText,
                    jobDescription,
                    jobTitle: jobTitle || 'Software Engineer', // Fallback if empty
                    companyName: companyName || 'Tech Company' // Fallback if empty
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create application');
            }

            const application = await response.json();

            // 2. Redirect to results page (which will trigger generation)
            toast.success('Draft created! Generating content...');
            router.push(`/applications/${application._id}`);

        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Something went wrong');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchResumeText = async (id: string) => {
        setIsFetchingResume(true);
        try {
            const response = await fetch(`/api/resumes/${id}`);
            if (!response.ok) throw new Error('Failed to fetch resume content');

            const data = await response.json();
            if (data.resume?.rawText) {
                setCvText(data.resume.rawText);
                return data.resume.rawText;
            } else {
                throw new Error('This resume has not been processed for text yet.');
            }
        } catch (error: any) {
            console.error('[FetchResume] Failed:', error);
            toast.error(error.message || 'Could not load resume text');
            return null;
        } finally {
            setIsFetchingResume(false);
        }
    };

    const handleUploadComplete = async (fileId: string, url: string, fileName: string) => {
        toast.success(`${fileName} uploaded! Processing text...`);
        // We set isFetchingResume to true to keep the button disabled while AI parses
        setIsFetchingResume(true);
    };

    const handleProcessComplete = async (fileId: string) => {
        await fetchResumeText(fileId);
    };

    const handleResumeSelect = async (resume: any) => {
        toast.success('Resume selected!');
        await fetchResumeText(resume._id);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:py-12">
                {/* Header */}
                <div className="mb-8 sm:mb-10 lg:mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-black mb-2 sm:mb-3 lg:mb-4">
                        CareerPilot
                    </h1>
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
                        Generate Your Application
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600">
                        Upload your CV for safekeeping, then paste the text below along with the job description.
                    </p>
                </div>

                {/* CV Input Section */}
                <div className="mb-6">
                    <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
                        Your CV / Resume
                    </label>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            {/* <TabsTrigger value="paste" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Paste Text
                            </TabsTrigger> */}
                            <TabsTrigger value="upload" className="flex items-center gap-2">
                                <UploadIcon className="h-4 w-4" />
                                Upload File
                            </TabsTrigger>
                        </TabsList>

                        {/* <TabsContent value="paste" className="mt-0">
                            <Textarea
                                placeholder="Paste the full text of your CV or resume here..."
                                value={cvText}
                                onChange={(e) => setCvText(e.target.value)}
                                className="min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] resize-none bg-white border-gray-300 rounded-lg text-sm sm:text-base"
                            />
                        </TabsContent> */}

                        <TabsContent value="upload" className="mt-0">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "new" | "existing")}>
                                    <TabsList className="mb-6">
                                        <TabsTrigger value="new">Upload New</TabsTrigger>
                                        <TabsTrigger value="existing">Select Existing</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="new">
                                        <FileUpload
                                            onUploadComplete={handleUploadComplete}
                                            onProcessComplete={handleProcessComplete}
                                        />
                                    </TabsContent>

                                    <TabsContent value="existing">
                                        <ResumeSelector onSelect={handleResumeSelect} />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Job Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
                            Job Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Senior Software Engineer"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
                            Company Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. TechCorp Inc."
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Job Description Section */}
                <div className="mb-6">
                    <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
                        Paste the Job Description
                    </label>
                    <Textarea
                        placeholder="Copy and paste the job description from the listing..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="min-h-[250px] sm:min-h-[350px] lg:min-h-[400px] resize-none bg-white border-gray-300 rounded-lg text-sm sm:text-base"
                    />
                </div>

                {/* Generate Button */}
                <div className="flex justify-center">
                    <Button
                        onClick={handleGenerate}
                        size="lg"
                        className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-lg shadow-sm hover:shadow-md"
                        disabled={!cvText || !jobDescription || isSubmitting || isFetchingResume}
                    >
                        {isSubmitting || isFetchingResume ? (
                            <>
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                                {isFetchingResume ? 'Loading Resume...' : 'Creating Draft...'}
                            </>
                        ) : (
                            <>
                                Generate
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
