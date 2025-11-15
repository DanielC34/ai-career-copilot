import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Career Copilot
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Generate tailored job application materials in seconds
          </p>
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
            Upload your CV and paste a job description. Our AI will create a customized 
            application package including a rewritten CV, cover letter, skills analysis, 
            and interview preparation questions.
          </p>
          
          <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Paste Your CV</h3>
                <p className="text-gray-600 text-sm">
                  Enter your existing CV text into our system
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Add Job Description</h3>
                <p className="text-gray-600 text-sm">
                  Paste the job posting you want to apply for
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Get AI Results</h3>
                <p className="text-gray-600 text-sm">
                  Receive tailored application materials instantly
                </p>
              </div>
            </div>
          </div>
          
          <Link 
            href="/generate" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-lg transition-colors duration-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
