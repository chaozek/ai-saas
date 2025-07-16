import { Hint } from "@/components/hint"
import { Button } from "@/components/ui/button"
import { Fragment } from "@/generated/prisma"
import { CopyIcon, ExternalLinkIcon, RefreshCcwIcon } from "lucide-react"
import React, { useState } from 'react'

export const FragmentWeb = ({fragment}: {fragment: Fragment}) => {
     const [fragmentKey, setFragmentKey] = useState(0)
     const [copied, setCopied] = useState(false)
     const onRefresh = () => {
        setFragmentKey((prev)=>prev+1)
     }
     const handleCopy = () => {
        navigator.clipboard.writeText(fragment.sandboxUrl ?? "")
        setCopied(true)
        setTimeout(()=>{
            setCopied(false)
        }, 2000)
     }
  return (
    <div className='h-full'>
     <div className="flex justify-end items-center gap-2 mb-4 px-2">
               <Hint text="Refresh" side="top" align="center">
                    <Button variant="outline" size="icon" onClick={onRefresh} className="shrink-0">
                         <RefreshCcwIcon className="w-4 h-4" />
                    </Button>
               </Hint>

          <Hint text="Copy to clipboard" side="top" align="center">
          <Button
            disabled={false}
            onClick={()=>handleCopy()}
            className="flex-1 justify-start text-start px-3 overflow-hidden"
            variant="outline"
          >
            <span className="truncate text-sm">{fragment.sandboxUrl}</span>
          </Button>
          </Hint>
          <Hint text="Open in new tab" side="top" align="center">

          <Button
            disabled={!fragment.sandboxUrl || copied}
            onClick={()=>{window.open(fragment.sandboxUrl ?? "", "_blank")}}
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            <ExternalLinkIcon className="w-4 h-4" />
          </Button>
            </Hint>
     </div>
     <iframe
        key={fragmentKey}
        src={fragment.sandboxUrl ?? ""}
        className='flex-1 w-full h-full rounded-md border'
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
     />
    </div>
  )
}