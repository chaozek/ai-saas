"use client"
import Image from "next/image";
import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";
export default function Page() {

  return (
   <div className="flex flex-col max-w-5xl mx-auto w-full">
    <section className="space-y-6 py-[16vh] 2xl:py-48">
     <div className="flex flex-col items-center gap-4">
     <Image src="/logo.svg" alt="logo" width={50} height={50} />
     <h1 className="text-4xl font-bold">
      Your AI-powered coding assistant.
     </h1>
     <p className="text-lg text-muted-foreground">
      Code faster with AI-powered coding assistant
     </p>
     </div>
<div className="max-w-3xl mx-auto w-full">
  <ProjectForm/>
</div>
<ProjectsList/>
    </section>
    </div>
  );
}
