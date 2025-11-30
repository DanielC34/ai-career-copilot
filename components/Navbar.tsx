"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded"></div>
          <span className="text-lg sm:text-xl font-semibold text-gray-900">
            AI Career Copilot
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          {status === 'loading' ? (
            <div className="h-9 w-20 bg-gray-100 animate-pulse rounded"></div>
          ) : session ? (
            <>
              <Link href="/applications/new">
                <Button variant="ghost" className="text-sm sm:text-base">
                  New Application
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-sm sm:text-base">
                  Dashboard
                </Button>
              </Link>
              <Link href="/resumes">
                <Button variant="ghost" className="text-sm sm:text-base">
                  My Resumes
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm sm:text-base"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-sm sm:text-base">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="text-sm sm:text-base">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
