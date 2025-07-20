"use client"
import { Logo } from "@/components/ui/logo";
import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";
export default function Page() {

  return (
   <div className="flex flex-col max-w-5xl mx-auto w-full">
    <section className="space-y-6 py-[16vh] 2xl:py-48">
     <div className="flex flex-col items-center gap-4">
     <Logo alt="logo" width={200} height={100} />
     <h1 className="text-4xl font-bold">
      Váš AI-asistent pro programování.
     </h1>
     <p className="text-lg text-muted-foreground">
      Programujte rychleji s AI-asistentem pro kódování
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
