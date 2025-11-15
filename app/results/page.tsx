'use client'

import { useState } from 'react'
import { Copy, Download, Check } from 'lucide-react'
import { AppNavbar } from '@/components/AppNavbar'

export default function CVResults() {
  const [activeTab, setActiveTab] = useState('cv')
  const [copied, setCopied] = useState(false)

  const handleCopyToClipboard = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    console.log('Download CV')
  }

  return (
    <>
      <AppNavbar />
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      {copied && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check className="w-5 h-5" />
          <span className="text-sm font-medium">Content copied successfully!</span>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Tabs */}
        <div className="flex gap-6 sm:gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cv')}
            className={`pb-4 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'cv'
                ? 'text-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Optimized CV
            {activeTab === 'cv' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`pb-4 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'cover'
                ? 'text-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cover Letter
            {activeTab === 'cover' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`pb-4 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'skills'
                ? 'text-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Skills Match & Gap
            {activeTab === 'skills' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`pb-4 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'interview'
                ? 'text-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Interview Prep
            {activeTab === 'interview' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
          {activeTab === 'cv' && 'Here is your AI-Optimized CV'}
          {activeTab === 'cover' && 'Your Cover Letter'}
          {activeTab === 'skills' && 'Skills Match & Gap Analysis'}
          {activeTab === 'interview' && 'Interview Preparation Questions'}
        </h1>

        {/* CV Content */}
        {activeTab === 'cv' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10 mb-6">
          {/* Professional Summary */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Professional Summary</h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              A highly motivated and detail-oriented software engineer with over 5 years of experience in developing, 
              testing, and maintaining web applications. Proficient in JavaScript, React, and Node.js, with a proven 
              track record of delivering high-quality code and collaborating effectively in agile environments.
            </p>
          </section>

          {/* Experience */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Experience</h2>
            
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                Senior Software Engineer, Tech Solutions Inc. (2020-Present)
              </h3>
              <ul className="space-y-2 ml-5">
                <li className="text-sm sm:text-base text-gray-700 list-disc">
                  Developed and maintained front-end architecture for a large-scale e-commerce platform, resulting in 
                  a 20% increase in performance.
                </li>
                <li className="text-sm sm:text-base text-gray-700 list-disc">
                  Collaborated with cross-functional teams to define, design, and ship new features.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                Software Engineer, Web Innovators (2018-2020)
              </h3>
              <ul className="space-y-2 ml-5">
                <li className="text-sm sm:text-base text-gray-700 list-disc">
                  Wrote clean, scalable, and well-documented code for client-side applications.
                </li>
                <li className="text-sm sm:text-base text-gray-700 list-disc">
                  Participated in code reviews to maintain code quality and share knowledge.
                </li>
              </ul>
            </div>
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Skills</h2>
            <ul className="space-y-2 ml-5">
              <li className="text-sm sm:text-base text-gray-700 list-disc">
                <strong>Programming Languages:</strong> JavaScript, Python, HTML/CSS
              </li>
              <li className="text-sm sm:text-base text-gray-700 list-disc">
                <strong>Frameworks & Libraries:</strong> React, Node.js, Express
              </li>
              <li className="text-sm sm:text-base text-gray-700 list-disc">
                <strong>Tools:</strong> Git, Docker, Jenkins
              </li>
            </ul>
          </section>
        </div>
        )}

        {/* Cover Letter Content */}
        {activeTab === 'cover' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10 mb-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm sm:text-base text-gray-700 mb-4">[Your Name]</p>
              <p className="text-sm sm:text-base text-gray-700 mb-4">[Your Address]</p>
              <p className="text-sm sm:text-base text-gray-700 mb-6">[Date]</p>
            </div>
            <div>
              <p className="text-sm sm:text-base text-gray-700 mb-4">Dear Hiring Manager,</p>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                I am writing to express my strong interest in the Software Engineer position at your company. With over 5 years of experience in web development and a proven track record of delivering high-quality solutions, I am confident in my ability to contribute to your team's success.
              </p>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                Throughout my career, I have developed expertise in JavaScript, React, and Node.js, consistently delivering projects that exceed expectations. At Tech Solutions Inc., I led the development of a large-scale e-commerce platform that resulted in a 20% performance improvement, demonstrating my ability to create efficient and scalable solutions.
              </p>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                I am particularly drawn to this opportunity because of your company's commitment to innovation and excellence. I am excited about the prospect of bringing my technical skills and collaborative approach to your team.
              </p>
              <p className="text-sm sm:text-base text-gray-700 mb-4">Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your team.</p>
              <p className="text-sm sm:text-base text-gray-700">Sincerely,</p>
              <p className="text-sm sm:text-base text-gray-700">[Your Name]</p>
            </div>
          </div>
        </div>
        )}

        {/* Interview Prep Content */}
        {activeTab === 'interview' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10 mb-6">
          <div className="space-y-8">
            <section>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Behavioral Questions</h3>
              <ol className="space-y-4">
                <li className="text-sm sm:text-base text-gray-700">
                  <span className="font-medium">1.</span> Can you describe a time you had to overcome a significant challenge in a team project? What was your role and what was the outcome?
                </li>
                <li className="text-sm sm:text-base text-gray-700">
                  <span className="font-medium">2.</span> Tell me about a situation where you had a conflict with a coworker. How did you handle it?
                </li>
                <li className="text-sm sm:text-base text-gray-700">
                  <span className="font-medium">3.</span> Describe a project you are particularly proud of. What did you do that made it a success?
                </li>
              </ol>
            </section>
            <section>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Technical Questions</h3>
              <ol className="space-y-4" start={4}>
                <li className="text-sm sm:text-base text-gray-700">
                  <span className="font-medium">4.</span> How do you stay updated with the latest trends in software development?
                </li>
                <li className="text-sm sm:text-base text-gray-700">
                  <span className="font-medium">5.</span> What is your approach to debugging complex code written by another developer?
                </li>
                <li className="text-sm sm:text-base text-gray-700">
                  <span className="font-medium">6.</span> Explain the difference between responsive design and adaptive design.
                </li>
              </ol>
            </section>
            <section>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Situational Questions</h3>
              <ol className="space-y-4" start={7}>
                <li className="text-sm sm:text-base text-gray-700">
                  <span className="font-medium">7.</span> Imagine you are given a project with a tight deadline and unclear requirements. What would be your first steps?
                </li>
                <li className="text-sm sm:text-base text-gray-700">
                  <span className="font-medium">8.</span> How would you handle negative feedback from a stakeholder on a design you've spent weeks working on?
                </li>
              </ol>
            </section>
          </div>
        </div>
        )}

        {/* Skills Match & Gap Content */}
        {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Matched Skills</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              These skills from your profile align with the job requirements.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></span>
                <span>JavaScript & React</span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></span>
                <span>Node.js Development</span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></span>
                <span>Agile Methodologies</span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></span>
                <span>Git Version Control</span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></span>
                <span>Web Application Development</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-6 h-6 text-yellow-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Skill Gaps</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Consider highlighting projects or experiences related to these skills.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></span>
                <span>TypeScript</span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></span>
                <span>GraphQL</span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></span>
                <span>AWS Cloud Services</span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></span>
                <span>CI/CD Pipelines</span>
              </li>
            </ul>
          </div>
        </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy to Clipboard
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </main>
    </div>
    </>
  )
}