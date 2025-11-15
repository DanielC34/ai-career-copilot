"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";

export default function ApplicationGenerator() {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const handleGenerate = () => {
    // Add your generation logic here
    console.log("Generating application materials...");
    console.log("CV:", cvText);
    console.log("Job Description:", jobDescription);
  };

  return (
    <>
      <AppNavbar />
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-black mb-2 sm:mb-3 lg:mb-4">CareerPilot</h1>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
            Generate Your Application
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Paste your CV and the job description below to generate tailored
            application materials.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mb-6 sm:mb-8">
          {/* CV/Resume Section */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-base sm:text-lg font-semibold text-gray-900">
              Paste Your CV / Resume
            </label>
            <Textarea
              placeholder="Paste the full text of your CV or resume here..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              className="min-h-[250px] sm:min-h-[350px] lg:min-h-[400px] resize-none bg-white border-gray-300 rounded-lg text-sm sm:text-base"
            />
          </div>

          {/* Job Description Section */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-base sm:text-lg font-semibold text-gray-900">
              Paste the Job Description
            </label>
            <Textarea
              placeholder="Copy and paste the job description from the listing..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[250px] sm:min-h-[350px] lg:min-h-[400px] resize-none bg-white border-gray-300 rounded-lg text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleGenerate}
            size="lg"
            className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg bg-blue-500 hover:bg-blue-600 rounded-lg"
            disabled={!cvText || !jobDescription}
          >
            Generate
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
