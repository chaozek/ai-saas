"use client"

import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Dumbbell, BarChart3, Calendar, Target } from "lucide-react"

export const Navbar = () => {
     return <nav className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-6">
               <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                         <span className="text-primary-foreground text-lg">💪</span>
                    </div>
                    <Logo alt="Logo" width={120} height={28} />
               </Link>

               <SignedIn>
                    <div className="hidden md:flex items-center gap-4">
                         <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                              <BarChart3 className="w-4 h-4" />
                              Přehled
                         </Link>
                         <Link href="/workouts" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                              <Dumbbell className="w-4 h-4" />
                              Tréninky
                         </Link>
                         <Link href="/progress" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                              <Target className="w-4 h-4" />
                              Pokrok
                         </Link>
                         <Link href="/schedule" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                              <Calendar className="w-4 h-4" />
                              Rozvrh
                         </Link>
                    </div>
               </SignedIn>
          </div>

          <div className="flex items-center gap-4">
               <ThemeToggle />
               <SignedIn>
                    <Button variant="outline" size="sm" asChild>
                         <Link href="/dashboard">Můj Plán</Link>
                    </Button>
                    <UserButton />
               </SignedIn>
               <SignedOut>
                    <div className="flex items-center gap-3">
                         <Button variant="ghost" size="sm" asChild>
                              <Link href="/pricing">Ceník</Link>
                         </Button>
                    <Button asChild>
                              <Link href="/sign-in">Demo</Link>
                    </Button>
                    </div>
               </SignedOut>
          </div>
     </nav>
}