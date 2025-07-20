import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {  useForm } from "react-hook-form";
import { z } from "zod";
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from "@/components/ui/button";
import { Loader2, SendIcon } from "lucide-react";
import { useTRPC } from "@/trcp/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Usage } from "@/modules/home/ui/components/usage";
import { useRouter } from "next/navigation";

const formSchema = z.object({
     value: z.string().min(1, {message: "Zpráva je povinná"})
})

     export const MessageForm = ({projectId}: {projectId: string}) => {
          const queryClient = useQueryClient()
         const [isFocused, setIsFocused] = useState(false);
         const trcp = useTRPC()
         const { data: usage } = useQuery({
          ...trcp.usage.getCredits.queryOptions()
        })
console.log(usage, "USAGE")
         const showUsage = !!usage
         const router = useRouter()
         const form = useForm({
              defaultValues: {
                   value: ""
               }
          })
          const createMessage = useMutation(trcp.messages.create.mutationOptions({
               onSuccess: () => {
                    form.reset()
                    queryClient.invalidateQueries(trcp.messages.getmany.queryOptions({
                         projectId: projectId
                    }))
                    queryClient.invalidateQueries(trcp.usage.getCredits.queryOptions())
               },
               onError: (error) => {
                    toast.error(error.message)
                    if(error.data?.code === "TOO_MANY_REQUESTS"){
                         router.push("/pricing")
                    }
               }
          }))
          const isPending = createMessage.isPending
          const isDisabled = isPending || !form.formState.isValid

         const onSubmit = async (value: z.infer<typeof formSchema>) => {
          await createMessage.mutateAsync({
               value: value.value,
               projectId: projectId
          })
         }

          return <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)}
                 className={cn(
                   "relative flex flex-col min-h-[96px] gap-2 border p-2 sm:p-4 rounded-2xl bg-background shadow-md transition-all",
                   showUsage ? "border-primary" : ""
                 )}
               >
                    {showUsage && <Usage remainingPoints={usage?.remainingPoints ?? 0} msBeforeNext={usage?.msBeforeNext ?? 0} />}
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
                          <span className="ml-1">k odeslání</span>
                   </div>
                   <Button variant="outline" size="icon" disabled={isDisabled} className={cn(isDisabled && "opacity-50")}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                   </Button>
                   </div>
                 </div>
              </form>
         </Form>
     }