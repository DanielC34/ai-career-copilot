"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/auth/LoginModal"
import { SignupModal } from "@/components/auth/SignupModal"

export function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  return (
    <>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded"></div>
            <span className="text-lg sm:text-xl font-semibold text-gray-900">
              AI Career Copilot
            </span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => setLoginOpen(true)}
              className="text-sm sm:text-base"
              data-login-trigger
            >
              Login
            </Button>
            <Button
              onClick={() => setSignupOpen(true)}
              className="text-sm sm:text-base"
              data-signup-trigger
            >
              Sign Up
            </Button>
          </nav>
        </div>
      </header>

      <LoginModal 
        open={loginOpen} 
        onOpenChange={setLoginOpen}
        onSwitchToSignup={() => setSignupOpen(true)}
      />
      <SignupModal 
        open={signupOpen} 
        onOpenChange={setSignupOpen}
        onSwitchToLogin={() => setLoginOpen(true)}
      />
    </>
  )
}
