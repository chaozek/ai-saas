"use client"
import { Button } from "@/components/ui/button"
import { trpc } from "@/trcp/server"
import { formatDistance, formatDistanceToNow, intervalToDuration } from "date-fns"
import Link from "next/link"
import { CreditCard } from "lucide-react"
import { useAuth } from "@clerk/nextjs"



export const Usage = ({remainingPoints, msBeforeNext}: {remainingPoints: number, msBeforeNext: number}) => {
     const {has} = useAuth()
     const hasProAccess = has?.({plan: "pro"})
     return <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 justify-between w-full">
               <span className="text-sm text-muted-foreground">
                    Resets in: {formatDistanceToNow(new Date(Date.now() + msBeforeNext), { includeSeconds: true })}
                    </span>
               <span className="text-sm text-muted-foreground">
                    Points: {remainingPoints}
                    </span>
                    {!hasProAccess && <Button variant="outline" size="sm" className="w-fit h-fit flex items-center gap-1 flex-row"><Link href="/pricing" className="flex items-center gap-1 p-1"> <CreditCard /> Buy Credits</Link></Button>}

          </div>
     </div>
}