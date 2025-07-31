"use client"

import { Button } from "@/components/ui/button";
import { Plus, Bell, Settings, User, LogOut, ChevronDown, Receipt, Sparkles, Activity } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
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
  const { user, signOut, openUserProfile } = useClerk();
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

  const handleNavigateToDashboard = () => {
    router.push('/dashboard');
  };

  return (
            <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative overflow-hidden rounded-b-lg shadow-lg">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white to-green-50/40 dark:from-slate-900/80 dark:via-slate-800 dark:to-green-950/20"></div>

      {/* Subtle accent gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50/20 to-transparent dark:via-green-950/10"></div>

      <div className="container mx-auto relative z-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left side - Logo and navigation */}
          <div className="flex items-center space-x-6 pl-2 lg:pl-4">
            {/* Logo with click handler */}
            <div
              onClick={handleNavigateToDashboard}
              className="cursor-pointer group transition-all duration-300 hover:scale-105"
            >
              <Logo
                width={140}
                height={32}
                className="transition-all duration-300 group-hover:drop-shadow-lg"
              />
            </div>

          </div>

          {/* Right side - Actions and user */}
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Action buttons */}


            {/* Theme toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gradient-to-b from-transparent via-border/50 to-transparent"></div>

            {/* Faktury button with enhanced styling */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToPayments}
              className="hidden sm:flex items-center gap-2 px-4 py-2 h-9 bg-gradient-to-r from-white to-green-50/30 dark:from-slate-800 dark:to-green-950/20 border border-green-200/60 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group"
            >
              <Receipt className="w-4 h-4 transition-transform group-hover:scale-110 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-700 dark:text-green-300">Faktury</span>
            </Button>

            {/* Mobile faktury button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToPayments}
              className="sm:hidden h-9 w-9 p-0 relative group"
            >
              <Receipt className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="sr-only">Faktury</span>
            </Button>

            {/* User dropdown with enhanced styling */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                                <Button
                  variant="ghost"
                  className="relative h-9 w-auto px-3 py-1 flex items-center gap-3 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20 transition-all duration-300 group"
                >
                  <Avatar className="h-7 w-7 border-2 border-green-200/50 group-hover:border-green-300/70 transition-all duration-300 shadow-sm">
                    <AvatarImage src={user?.imageUrl} alt={userName || 'User'} />
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                      {userName ? getUserInitials(userName) : 'FE'}
                    </AvatarFallback>
                  </Avatar>

                  {/* User status indicator */}
                  <div className="hidden lg:flex items-center gap-2">
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground">
                        {userName || 'Fitness Enthusiast'}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-muted-foreground">Online</span>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-hover:rotate-180" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-border/30">
                        <AvatarImage src={user?.imageUrl} alt={userName || 'User'} />
                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {userName ? getUserInitials(userName) : 'FE'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold leading-none">{userName || 'Fitness Enthusiast'}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          {user?.emailAddresses?.[0]?.emailAddress}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Premium Member</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                                <DropdownMenuItem
                  onClick={() => openUserProfile()}
                  className="p-3 cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20 transition-all duration-200"
                >
                  <Settings className="mr-3 h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>Nastavení</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleNavigateToPayments}
                  className="p-3 cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20 transition-all duration-200"
                >
                  <Receipt className="mr-3 h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>Faktury & Platby</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="p-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Odhlásit se</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}