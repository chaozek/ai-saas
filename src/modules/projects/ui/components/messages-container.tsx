"use client"

import { useTRPC } from "@/trcp/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { MessageCard } from "./message-card"
import { MessageForm } from "./message-form"
import { Suspense, useEffect, useRef } from "react"
import { Fragment } from "@/generated/prisma";
import { MessageLoading } from "./message-loading"
import { ProjectHeader } from "./project-header"
import { ErrorBoundary } from "react-error-boundary";

export const MessagesContainer = ({projectId, activeFragment, setActiveFragment}: {projectId: string, activeFragment: Fragment | null, setActiveFragment: (fragment: Fragment | null) => void}) => {
     const trpc = useTRPC()
     const {data: messages} = useSuspenseQuery(trpc.messages.getmany.queryOptions({
          projectId,
     }, {
          refetchInterval: 2000,
     }))
     const lastAssistantMessafeIdRef = useRef<string | null>(null)
     const bottomRef = useRef<HTMLDivElement>(null)
     useEffect(() => {
          const lastMessage = messages.findLast((m) => m.role === "ASSISTANT")
          if(lastMessage && lastMessage.id !== lastAssistantMessafeIdRef.current){
               lastAssistantMessafeIdRef.current = lastMessage.id
               setActiveFragment(lastMessage.fragment)
          }
     }, [ messages, setActiveFragment])

     useEffect(() => {
          bottomRef.current?.scrollIntoView({behavior: "smooth"})
     }, [messages.length])
const lastMessage = messages[messages.length - 1]
const isLastMessageUser = lastMessage?.role === "USER"
     return (
      <div className="flex flex-col h-full max-h-[80vh] rounded-2xl border border-muted-foreground/10 bg-background/80 shadow-md overflow-hidden">
          <ErrorBoundary fallback={<div>Chyba</div>}>
            <Suspense fallback={<div>Načítání...</div>}>
            <ProjectHeader projectId={projectId} />
            </Suspense>
          </ErrorBoundary>
        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-4 bg-muted/30">
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                id={message.id}
                content={message.content}
                role={message.role}
                type={message.type}
                fragment={message.fragment}
                createdAt={message.createdAt}
                isActiveFragment={activeFragment?.id === message.fragment?.id}
                onFragmentClick={() => {
                    setActiveFragment(message.fragment)
                }}
              />
            ))}
          </div>
          {isLastMessageUser && <MessageLoading/> }
          <div ref={bottomRef} />
        </div>
        <div className="p-3 bg-background border-t border-muted-foreground/10 relative">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
          <MessageForm projectId={projectId} />
        </div>
      </div>
     )
}