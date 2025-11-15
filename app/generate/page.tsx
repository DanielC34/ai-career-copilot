'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'

export default function GeneratePage() {
  const router = useRouter()
  const { cv, jobDescription, setCV, setJobDescription, setGeneratedContent, setIsLoading } = useAppStore()
  const [errors, setErrors] = useState<{ cv?: string; jobDescription?: string }>({})

  const validateInputs = () => {
    const newErrors: { cv?: string; jobDescription?: string } = {}
    
    if (!cv || cv.trim().length < 100) {
      newErrors.cv = 'CV must be at least 100 characters long'
    }
    
    if (!jobDescription || jobDescription.trim().length < 50) {
      newErrors.jobDescription = 'Job description must be at least 50 characters long'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGenerate = async () => {
    if (!validateInputs()) {
      toast.error('Please fix the errors before generating')
      return
    }

    setIsLoading(true)
    const loadingToast = toast.loading('Generating your application pack...')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cv, jobDescription }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate content')
      }

      const data = await response.json()
      setGeneratedContent(data)
      toast.success('Application pack generated successfully!', { id: loadingToast })
      router.push('/results')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred', { id: loadingToast })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Generate Application Pack</h1>
            <p className="text-gray-600">Fill in your CV and the job description to get started</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label htmlFor="cv" className="block text-lg font-semibold text-gray-800 mb-2">
              Your CV
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Paste your current CV text here (minimum 100 characters)
            </p>
            <textarea
              id="cv"
              value={cv}
              onChange={(e) => {
                setCV(e.target.value)
                if (errors.cv) setErrors({ ...errors, cv: undefined })
              }}
              className={`w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cv ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your CV text here..."
            />
            <div className="flex justify-between items-center mt-2">
              {errors.cv && <p className="text-red-500 text-sm">{errors.cv}</p>}
              <p className="text-sm text-gray-500 ml-auto">{cv.length} characters</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label htmlFor="jobDescription" className="block text-lg font-semibold text-gray-800 mb-2">
              Job Description
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Paste the job posting you want to apply for (minimum 50 characters)
            </p>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value)
                if (errors.jobDescription) setErrors({ ...errors, jobDescription: undefined })
              }}
              className={`w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.jobDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter the job description here..."
            />
            <div className="flex justify-between items-center mt-2">
              {errors.jobDescription && <p className="text-red-500 text-sm">{errors.jobDescription}</p>}
              <p className="text-sm text-gray-500 ml-auto">{jobDescription.length} characters</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
            >
              Back to Home
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!cv || !jobDescription}
            >
              Generate Application Pack
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
