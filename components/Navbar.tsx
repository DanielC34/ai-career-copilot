"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="hidden sm:inline-block max-w-[150px] truncate">
                      {session.user?.name || session.user?.email || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
