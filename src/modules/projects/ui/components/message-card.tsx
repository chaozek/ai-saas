import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"
import { MessageRole, MessageType, Fragment } from "@/generated/prisma"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

const UserMessage = ({content, createdAt}: {content: string, createdAt: Date}) => {
     return <div className="flex justify-end pb-4 pr-2 pl-10 sm:pl-20">
         <Card className="rounded-2xl bg-primary/10 p-4 shadow-md border border-primary/10 max-w-[80%] sm:max-w-[60%]">
          <p className="text-xs text-muted-foreground mb-1 text-right opacity-70">{createdAt.toLocaleString()}</p>
          <p className="text-base leading-relaxed break-words text-right">{content}</p>
         </Card>
     </div>
}

const FragmentCard = ({isActiveFragment, fragment, onFragmentClick}: {isActiveFragment: boolean, fragment: Fragment, onFragmentClick: () => void}) => {
     return <div className={cn("flex items-center gap-2 mt-2 p-2 rounded-lg transition-colors justify-between  border border-muted-foreground/10", isActiveFragment ? "bg-accent/30 border-primary" : "bg-muted/50 hover:bg-accent/20 cursor-pointer") } onClick={onFragmentClick}>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate max-w-[120px]">{fragment.title || "Untitled"} preview</p>
          <Button asChild variant="outline" size="icon"  >
            <Link href={fragment.sandboxUrl} target="_blank">
            <ExternalLinkIcon className="w-4 h-4" />
            </Link>
         </Button>
     </div>
}
const AssistantMessage = ({content, createdAt, type, isActiveFragment, fragment, onFragmentClick, id}: {content: string, createdAt: Date, type: MessageType, isActiveFragment: boolean, fragment: Fragment | null, onFragmentClick: () => void, id: string}) => {

     return <div id={`message-${id}`} className="flex justify-start pb-4 pl-2 pr-10 sm:pr-20">
         <Card className={cn(
           "rounded-2xl p-4 shadow-md border max-w-[80%] sm:max-w-[60%]",
           type === "ERROR"
             ? "bg-destructive/10 text-destructive-foreground border-destructive/30"
             : "bg-muted border-muted-foreground/10"
         )}>
         <div className="flex items-center gap-2 mb-1">
         <Image src="/logo.svg" alt="agent" width={24} height={24} className="w-6 h-6 rounded-full bg-white border" />
         <p className="text-xs text-muted-foreground opacity-70">{format(createdAt, "MMM d, yyyy h:mm a")}</p>
         </div>
          <p className="text-base leading-relaxed break-words">{content}</p>
          {fragment && type === "RESULT" && (
               <FragmentCard isActiveFragment={isActiveFragment} fragment={fragment} onFragmentClick={onFragmentClick} />
          )}
         </Card>

     </div>
}
export const MessageCard = ({content, role, type, fragment, createdAt, isActiveFragment, onFragmentClick, id}: {content: string, role: MessageRole, type: MessageType, fragment: Fragment | null, createdAt: Date, isActiveFragment: boolean, onFragmentClick: () => void, id: string}) => {

if(role === "ASSISTANT") {
     return <AssistantMessage  type={type} isActiveFragment={isActiveFragment} fragment={fragment} onFragmentClick={onFragmentClick} content={content} createdAt={createdAt} id={id}     />
}
   return <UserMessage content={content} createdAt={createdAt} />
}