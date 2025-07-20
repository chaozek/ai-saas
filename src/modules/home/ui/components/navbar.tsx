"use client"

import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export const Navbar = () => {
     return <nav className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
               <Link href="/" className="flex items-center gap-2">
                    <Logo alt="Logo" width={150} height={32} />
               </Link>
          </div>
          <div className="flex items-center gap-4">
               <SignedIn>
                    <UserButton />
               </SignedIn>
               <SignedOut>
                    <Button asChild>
                         <Link href="/sign-in">Přihlásit se</Link>
                    </Button>
               </SignedOut>
          </div>
     </nav>
}