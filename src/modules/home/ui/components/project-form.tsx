import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {  useForm } from "react-hook-form";
import { z } from "zod";
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from "@/components/ui/button";
import { Loader2, SendIcon } from "lucide-react";
import { useTRPC } from "@/trcp/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "../../constancts";
import { useClerk } from "@clerk/nextjs";

const formSchema = z.object({
     value: z.string().min(1, {message: "Message is required"})
})

     export const ProjectForm = () => {
          const queryClient = useQueryClient()
         const [isFocused, setIsFocused] = useState(false);
         const [showUsage, setShowUsage] = useState(false);
         const trcp = useTRPC()
         const router = useRouter()
          const clerk = useClerk()
         const form = useForm({
              defaultValues: {
                   value: ""
               }
          })
          const createProject = useMutation(trcp.projects.create.mutationOptions({
               onSuccess: (data) => {
                    queryClient.invalidateQueries(trcp.projects.getmany.queryOptions())
                         router.push(`/projects/${data.id}`)
               },
               onError: (error) => {
                    if(error.data?.code === "TOO_MANY_REQUESTS"){
                         router.push("/pricing")
                    }
                    if(error.data?.code === "UNAUTHORIZED") {
                         clerk.openSignIn()
                    }else{
                         toast.error(error.message)
                    }
               }
          }))
          const isPending = createProject.isPending
          const isDisabled = isPending || !form.formState.isValid

         const onSubmit = async (value: z.infer<typeof formSchema>) => {
          await createProject.mutateAsync({
               value: value.value,

          })
         }


const onSelect = (content:string) => {
     form.setValue("value", content, {shouldValidate: true, shouldDirty: true, shouldTouch: true})
}
          return <Form {...form}>
               <section className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
               <form onSubmit={form.handleSubmit(onSubmit)}
                 className={cn(
                   "relative flex flex-col min-h-[96px] gap-2 border p-2 sm:p-4 rounded-2xl bg-background shadow-md transition-all",
                   showUsage ? "border-primary" : ""
                 )}
               >
                 <div className="flex-1 flex flex-col justify-between">
                   <FormField control={form.control} name="value" render={({field}) => (
                     <TextareaAutosize
                       disabled={isPending}
                       onFocus={() => setIsFocused(true)}
                       minRows={2}
                       maxRows={8}
                       className={cn(
                         "pt-4 px-4 resize-none border-none w-full outline-none bg-transparent text-base text-foreground placeholder:text-muted-foreground font-medium transition-all",
                         isFocused ? "bg-accent/30 shadow-inner" : "bg-transparent"
                       )}
                       style={{borderRadius: 12, boxShadow: isFocused ? '0 0 0 2px var(--primary)' : undefined}}
                       placeholder="Co chceš postavit?"
                       onKeyDown={(e)=>{
                            if(e.key === "Enter" && (!e.ctrlKey || !e.metaKey || !e.shiftKey)){
                                 e.preventDefault();
                                 form.handleSubmit(onSubmit)(e);
                            }
                       }} {...field} />
                   )} />
                   <div className="flex gap-x-2 items-end justify-between pt-2 w-full mt-auto">
                     <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-x-1 bg-muted/40 px-2 py-1 rounded-md shadow-sm border border-muted-foreground/10">
                          <kbd className="px-1.5 py-0.5 rounded bg-muted-foreground/20 text-xs font-semibold tracking-wide border border-muted-foreground/20">
                               <span className="font-sans">&#8984;</span>Enter
                          </kbd>
                          <span className="ml-1">to send</span>
                   </div>
                   <Button variant="outline" size="icon" disabled={isDisabled} className={cn(isDisabled && "opacity-50")}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                   </Button>
                   </div>
                 </div>
              </form>
              <div className="flex justify-center gap-2 hidden md:flex flex-wrap mt-4">
               {PROJECT_TEMPLATES.map((template) => (
                    <Button key={template.title} variant="outline" className="flex flex-col gap-2" onClick={() => onSelect(template.prompt)}>
                         <span className="text-sm font-medium"> {template.emoji} {template.title}</span>
                    </Button>
               ))}
              </div>
               </section>
               </Form>
     }