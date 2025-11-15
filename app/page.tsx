import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Craft Your Perfect Job Application with AI.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Generate tailored resumes, cover letters, and more in seconds.
          </p>
          <div className="pt-2 sm:pt-4">
            <Link href="/generate">
              <Button className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 mb-4 sm:mb-6">
            <a
              href="#privacy"
              className="text-sm sm:text-base text-gray-600 hover:text-gray-900"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-sm sm:text-base text-gray-600 hover:text-gray-900"
            >
              Terms of Service
            </a>
          </div>
          <div className="text-center text-gray-500 text-xs sm:text-sm">
            © 2025 AI Career Copilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
