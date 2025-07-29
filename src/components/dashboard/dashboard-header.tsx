"use client"

import { Button } from "@/components/ui/button";
import { Plus, Bell, Settings, User, LogOut, ChevronDown, Receipt } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  userName?: string | null;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { user, signOut } = useClerk();
  const router = useRouter();

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigateToPayments = () => {
    router.push('/platby');
  };

  return (
    <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left side - Title and subtitle */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Nástěnka
              </h2>
            </div>

          </div>

          {/* Right side - Actions and user */}
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Action buttons */}
           {/*  <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </div> */}

            {/* Theme toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-border/50"></div>

            {/* New plan button */}
       {/*      <Button size="sm" className="hidden sm:flex items-center gap-2 px-4 py-2 h-9">
              <Plus className="w-4 h-4" />
              <span className="font-medium">New Plan</span>
            </Button> */}

            {/* Mobile new plan button */}
            <Button size="sm" className="sm:hidden h-9 w-9 p-0">
              <Plus className="w-4 h-4" />
              <span className="sr-only">New Plan</span>
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-auto px-2 py-1 flex items-center gap-2 hover:bg-accent">
                  <Avatar className="h-7 w-7 border border-border/50">
                    <AvatarImage src={user?.imageUrl} alt={userName || 'User'} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {userName ? getUserInitials(userName) : 'FE'}
                    </AvatarFallback>
                  </Avatar>

                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName || 'Fitness Enthusiast'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleNavigateToPayments}>
                  <Receipt className="mr-2 h-4 w-4" />
                  <span>Faktury</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}