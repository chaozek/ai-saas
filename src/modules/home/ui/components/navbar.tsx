"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs"
import useScroll from "@/hooks/use-scroll"
import { cn } from "@/lib/utils"

export const Navbar = () => {
  const isScrolled = useScroll()
  return (
    <nav className={  cn("w-full border-b bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50", isScrolled && "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60")}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-x-3">
          <Link href="/" className="flex items-center gap-x-2">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="font-bold text-lg tracking-tight">AI SaaS</span>
          </Link>
        </div>
        <div className="flex items-center gap-x-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />

          </SignedIn>
        </div>
      </div>
    </nav>
  )
}