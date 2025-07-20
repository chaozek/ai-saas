"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SignedIn, UserButton, useAuth } from "@clerk/nextjs"

import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { FragmentWeb } from "../components/fragment-web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileCollection, FileExplorer } from "@/components/file-explorer";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const ProjectViews = ({projectId}: {projectId: string}) => {
const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
 const [tabState, setTabState] = useState<"preview" | "code">("preview")
 const {has} = useAuth()
 const hasProAccess = has?.({plan: "pro"})
 const [isHydrated, setIsHydrated] = useState(false);
console.log(activeFragment, "activeFragment")
 useEffect(() => {
   setIsHydrated(true);
 }, []);
     return <div className="h-screen w-screen flex flex-col">
          <ResizablePanelGroup direction="horizontal">
               <ResizablePanel defaultSize={35} minSize={20} className=" flex flex-col min-h-0">
                    <ErrorBoundary fallback={<div>Chyba</div>}>
                    <Suspense fallback={<div>Načítání...</div>}>
                    <MessagesContainer activeFragment={activeFragment} setActiveFragment={setActiveFragment} projectId={projectId} />
                    </Suspense>
                    </ErrorBoundary>
               </ResizablePanel>
               <ResizableHandle withHandle />
               <ResizablePanel defaultSize={65} minSize={50} className="flex flex-col min-h-0">
                <Tabs defaultValue="preview" className="h-full">
                         <div className="flex items-center justify-between mx-2 mt-2">
                           <TabsList>
                             <TabsTrigger value="preview" className="flex items-center gap-2">Náhled <EyeIcon className="w-4 h-4" /></TabsTrigger>
                             <TabsTrigger value="code">Kód <CodeIcon className="w-4 h-4" /></TabsTrigger>
                           </TabsList>
                        <div className="flex items-center gap-2">
                        {!hasProAccess && (
    <Button asChild variant="outline" className="flex items-center gap-2">
      <Link href={`/pricing`}>
        Upgrade <CrownIcon className="w-4 h-4 ml-2" />
      </Link>
    </Button>
  )}
  <SignedIn>
    <UserButton />
  </SignedIn>
                        </div>
                         </div>
                    <TabsContent value="preview">
                         {activeFragment &&  <FragmentWeb fragment={activeFragment} />}
                    </TabsContent>
                    <TabsContent value="code" className="h-full min-h-0">
                         {!!activeFragment?.files && <FileExplorer files={activeFragment.files as FileCollection} />}
                    </TabsContent>
                    </Tabs>
               </ResizablePanel>
          </ResizablePanelGroup>
     </div>
}