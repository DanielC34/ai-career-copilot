"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useSession, signOut } from "next-auth/react"
import {
    LayoutDashboard,
    PlusCircle,
    FileText,
    Menu,
    LogOut,
    User,
    Sparkles
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            active: pathname === "/dashboard",
        },
        {
            label: "New Application",
            icon: PlusCircle,
            href: "/applications/new",
            active: pathname === "/applications/new",
        },
        {
            label: "My Resumes",
            icon: FileText,
            href: "/resumes",
            active: pathname === "/resumes",
        },
    ]

    const SidebarContent = () => (
        <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14" onClick={() => setOpen(false)}>
                    <div className="relative w-8 h-8 mr-4">
                        <div className="absolute inset-0 bg-blue-500 rounded-lg opacity-20 animate-pulse"></div>
                        <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold">
                        Career Copilot
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                route.active ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.active ? "text-blue-500" : "text-zinc-400")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* User Profile Section */}
            <div className="px-3 py-2 border-t border-white/10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start pl-2 hover:bg-white/10 text-zinc-400 hover:text-white h-auto py-3">
                            <div className="flex items-center gap-x-3 w-full">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex flex-col items-start text-xs overflow-hidden">
                                    <span className="font-medium truncate w-full text-left">{session?.user?.name || 'User'}</span>
                                    <span className="text-zinc-500 truncate w-full text-left">{session?.user?.email}</span>
                                </div>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="cursor-pointer text-red-600 focus:text-red-600">
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile Sidebar */}
            <div className="md:hidden flex items-center p-4 bg-gray-900 text-white sticky top-0 z-50">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 -ml-2">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 bg-gray-900 border-r-gray-800 w-72 text-white">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
                <div className="ml-4 font-bold text-lg flex items-center gap-2">
                    <div className="relative w-6 h-6">
                        <div className="absolute inset-0 bg-blue-500 rounded-md opacity-20"></div>
                        <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    Career Copilot
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50 bg-gray-900">
                <SidebarContent />
            </div>
        </>
    )
}
