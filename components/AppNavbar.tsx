"use client"

import Link from "next/link"
import { User } from "lucide-react"

export function AppNavbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded"></div>
            <span className="text-lg sm:text-xl font-semibold text-gray-900">AI Career Copilot</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/generate" className="text-sm lg:text-base text-gray-700 hover:text-gray-900">Generate</Link>
            <Link href="/results" className="text-sm lg:text-base text-gray-700 hover:text-gray-900">Results</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button className="px-4 sm:px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors">
              Upgrade
            </button>
            <Link href="/profile" className="w-10 h-10 bg-amber-200 hover:bg-amber-300 rounded-full flex items-center justify-center transition-colors">
              <User className="w-5 h-5 text-amber-700" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
