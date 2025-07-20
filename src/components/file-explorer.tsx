import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable"
import { CodeView } from "./code-view"
import "./code-view/code-theme.css"
import { Hint } from "./hint"
import { Button } from "./ui/button"
import { CopyIcon } from "lucide-react"
import { convertFilesToTreeItems } from "@/lib/utils"
import { TreeView } from "./tree-view"
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb"



export type FileCollection = {[path: string] : string}
function getLanguageExtension(lang: string) {
     const extention = lang.split(".").pop()
     if (extention) {
          return extention
     }
     return "text"
}

type FileBreadcrumbProps = {
     filePath: string
}
const FileBreadcrumb = ({filePath} : FileBreadcrumbProps)=>{
    const renderBreadcrumbItems = () =>{
     const pathSegments = filePath.split("/")
     const maxSegments = 4
     if(pathSegments.length < maxSegments){

     return pathSegments.map((segment,index)=>{
          const isLast = index === pathSegments.length - 1

          return (
               <Fragment key={index}>
                   <BreadcrumbItem>
                   {
                    isLast ? (<BreadcrumbPage className="font-medium">{segment}</BreadcrumbPage>) : <span className="text-muted-foreground">{segment}</span>
                   }</BreadcrumbItem>
                   {!isLast && <BreadcrumbSeparator/>}
               </Fragment>
          )
     })
          }else{
          const firstSegment = pathSegments[0]
          const lastSegment = pathSegments[pathSegments.length - 1]
          const middleSegments = pathSegments.slice(1, pathSegments.length - 1)
          return <>
          <BreadcrumbItem>
          <span className="text-muted-foreground">{firstSegment}</span>
               <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                         <BreadcrumbEllipsis/>
                         </BreadcrumbItem>
                         <BreadcrumbItem>
                         <BreadcrumbSeparator/>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">
                    {lastSegment}
                    </BreadcrumbPage>
                    </BreadcrumbItem>
               </BreadcrumbItem></>
          }
    }
return (
     <Breadcrumb>
     <BreadcrumbList>
     {renderBreadcrumbItems()}
     </BreadcrumbList>
     </Breadcrumb>
)
}
export const FileExplorer = ({files}: {files: FileCollection}) => {
     console.log(files, "filesfilesfiles")
     const fileKeys = Object.keys(files)

     const [selectedFile, setSelectedFile] = useState<string | null>(()=>{
          return fileKeys.length > 0 ? fileKeys[0] : null
     })
     console.log(fileKeys, "KEYSS")

     // Aktualizuj selectedFile když se změní files
     useEffect(() => {
          if (fileKeys.length > 0) {
               // Pokud je selectedFile null nebo už neexistuje, vyber první soubor
               if (!selectedFile || !files[selectedFile]) {
                    setSelectedFile(fileKeys[0])
               }
          } else {
               setSelectedFile(null)
          }
     }, [files, selectedFile, fileKeys])

     const treeData = useMemo(()=>{
          return convertFilesToTreeItems(files)
     }, [files])

     const handleFileSelect = useCallback((path: string) => {
        if(files[path]) {
          setSelectedFile(path)
        }
     }, [files])
     return (
          <ResizablePanelGroup direction="horizontal">
               <ResizablePanel defaultSize={30} minSize={20} className="bg-sidebar">
                   <TreeView data={treeData} value={selectedFile} onSelect={handleFileSelect} />
               </ResizablePanel>
               <ResizableHandle className="hover:bg-primary transition-colors" />
               <ResizablePanel defaultSize={70} minSize={60} className="bg-sidebar">
                    { selectedFile && files[selectedFile] ? <div className="flex h-full flex-col text-muted-foreground">
                         <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
                              <FileBreadcrumb filePath={selectedFile} />
                              <Hint text="Kopírovat do schránky" side="bottom">
                                   <Button variant="outline" size="icon" className="ml-auto" disabled={false} onClick={()=>{
                                        navigator.clipboard.writeText(files[selectedFile])
                                   }}>
                                        <CopyIcon className="w-4 h-4" />
                                   </Button>
                              </Hint>
                         </div>
                         <div className="flex-1 overflow-auto">
                              <CodeView lang={getLanguageExtension(selectedFile)} code={files[selectedFile]} />
                         </div>
                    </div> : <div className="flex h-full items-center justify-center text-muted-foreground">Vyberte soubor k zobrazení</div>}
               </ResizablePanel>
          </ResizablePanelGroup>
     )
}