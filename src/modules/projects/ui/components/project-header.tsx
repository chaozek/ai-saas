import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTRPC } from "@/trcp/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ChevronDownIcon, ChevronLeftIcon,  MonitorIcon, SunIcon, SunMoonIcon } from "lucide-react"
import { MoonIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React from 'react'
import { useTheme } from "next-themes"

export const ProjectHeader = ({projectId}: {projectId: string}) => {
     const trpc = useTRPC()
     const {theme, setTheme} = useTheme()
     const {data: project} = useSuspenseQuery(trpc.projects.getOne.queryOptions({
          id: projectId,
     }))
  return (
    <div className="flex items-center justify-between p-2">
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size={"sm"}>
               <ChevronDownIcon className="w-4 h-4" />
            <Image src="/logo.svg" alt="logo" width={24} height={24} className="w-4 h-4" />
            <span className="text-sm font-medium">{project.name}</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start">
            <DropdownMenuItem asChild>
                <Link href={`/`} className="flex items-center gap-2">
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Back to dashboard</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <SunMoonIcon className="w-4 h-4" />
                    <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={theme} onValueChange={(value)=>setTheme(value)}>
                      <DropdownMenuRadioItem value="light">
                        <SunIcon className="w-4 h-4" />
                        <span>Light</span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">
                        <MoonIcon className="w-4 h-4" />
                        <span>Dark</span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">
                        <MonitorIcon className="w-4 h-4" />
                        <span>System</span>
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
        </DropdownMenuContent>
       </DropdownMenu>
    </div>
  )
}