"use client"

import { useTRPC } from "@/trcp/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Logo } from "@/components/ui/logo"

export const ProjectHeader = ({projectId}: {projectId: string}) => {
     const trpc = useTRPC()
     const {data: project} = useSuspenseQuery(trpc.projects.getOne.queryOptions({
          id: projectId
     }))
     return <div className="flex items-center gap-2 p-4 border-b">
          <Logo alt="logo" width={24} height={24} className="w-4 h-4" />
          <span className="text-sm font-medium">{project.name}</span>
     </div>
}