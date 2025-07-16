import { ProjectViews } from "@/modules/projects/ui/views/project-views";
import { getQueryClient, trpc } from "@/trcp/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

const ProjectPage = async ({params}: {params: {projectId: string}}) => {
     const {projectId} = await params;
const queryClient = getQueryClient()
void queryClient.prefetchQuery(trpc.messages.getmany.queryOptions({
     projectId
}))
void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
     id: projectId
}))
const dehydratedState = dehydrate(queryClient)
return <HydrationBoundary state={dehydratedState}>
     <ProjectViews projectId={projectId} />
</HydrationBoundary>
};

export default ProjectPage;