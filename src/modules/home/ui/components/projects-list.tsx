"use client"


import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trcp/client"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
export const ProjectsList = () => {
     const router = useRouter()
     const trcp = useTRPC()
     const {data: projects} = useQuery(trcp.projects.getmany.queryOptions())
     if(projects?.length === 0) return null
     return <div className="w-full bg-white dark:bg-sidebar rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-4">
          <h2 className="text-2xl font-bold">Uložené projekty</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.length === 0 ? (
               <div className="flex flex-col gap-y-2 bg-white dark:bg-sidebar rounded-xl p-4 border">
                    <div className="flex items-center gap-x-2">
                         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary">🎬</span>
                         </div>
                    </div>
               </div>
          ) : (
               projects?.map((project) => (
               <Button key={project.id} variant="outline" className="flex flex-col gap-y-2 bg-white dark:bg-sidebar rounded-xl p-6 border" onClick={() => router.push(`/projects/${project.id}`)}>
                    <div className="flex flex-start  gap-x-2 flex-col p-5">
                         <div className="  flex">
                              <span className="text-primary">{project.name}</span>
                         </div>
                         <p className="text-xs text-muted-foreground">{formatDistanceToNow(project.createdAt, {addSuffix: true})}</p>
                    </div>
               </Button>
               ))
               )}
          </div>
     </div>
}