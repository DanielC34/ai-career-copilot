'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'

type TabType = 'cv' | 'coverLetter' | 'skills' | 'interview' | 'summary'

export default function ResultsPage() {
  const router = useRouter()
  const { generatedContent, reset } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabType>('summary')

  if (!generatedContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No results to display</p>
          <button
            onClick={() => router.push('/generate')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            Generate Application Pack
          </button>
        </div>
      </div>
    )
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${label} copied to clipboard!`))
      .catch(() => toast.error('Failed to copy to clipboard'))
  }

  const handleStartOver = () => {
    reset()
    router.push('/generate')
  }

  const tabs = [
    { id: 'summary' as TabType, label: 'Summary', icon: '📋' },
    { id: 'cv' as TabType, label: 'Rewritten CV', icon: '📄' },
    { id: 'coverLetter' as TabType, label: 'Cover Letter', icon: '✉️' },
    { id: 'skills' as TabType, label: 'Skills Analysis', icon: '🎯' },
    { id: 'interview' as TabType, label: 'Interview Prep', icon: '💼' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Application Pack</h1>
              <p className="text-gray-600">AI-generated materials tailored to your job application</p>
            </div>
            <button
              onClick={handleStartOver}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
            >
              Start Over
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'summary' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Application Summary</h2>
                    <button
                      onClick={() => copyToClipboard(generatedContent.summary, 'Summary')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{generatedContent.summary}</p>
                  </div>
                </div>
              )}

              {activeTab === 'cv' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Rewritten CV</h2>
                    <button
                      onClick={() => copyToClipboard(generatedContent.rewrittenCV, 'CV')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="prose max-w-none bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{generatedContent.rewrittenCV}</p>
                  </div>
                </div>
              )}

              {activeTab === 'coverLetter' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Cover Letter</h2>
                    <button
                      onClick={() => copyToClipboard(generatedContent.coverLetter, 'Cover Letter')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="prose max-w-none bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{generatedContent.coverLetter}</p>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Skills Analysis</h2>
                    <button
                      onClick={() => copyToClipboard(
                        `Skills Match:\n${generatedContent.skillsMatch.join('\n')}\n\nSkills Gap:\n${generatedContent.skillsGap.join('\n')}`,
                        'Skills Analysis'
                      )}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Skills Match</h3>
                      <ul className="space-y-2">
                        {generatedContent.skillsMatch.map((skill, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span className="text-gray-700">{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-orange-800 mb-3">📚 Skills to Develop</h3>
                      <ul className="space-y-2">
                        {generatedContent.skillsGap.map((skill, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-600 mr-2">•</span>
                            <span className="text-gray-700">{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'interview' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Interview Preparation</h2>
                    <button
                      onClick={() => copyToClipboard(generatedContent.interviewQuestions.join('\n\n'), 'Interview Questions')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="space-y-4">
                    {generatedContent.interviewQuestions.map((question, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-medium text-blue-900">Question {index + 1}:</p>
                        <p className="text-gray-700 mt-2">{question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
