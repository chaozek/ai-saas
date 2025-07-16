import { ProjectViews } from "@/modules/projects/ui/views/project-views";
import { getQueryClient, trpc } from "@/trcp/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

type PageProps = {
    params: Promise<{
        projectId: string;
    }>;
};

const ProjectPage = async ({ params }: PageProps) => {
    const { projectId } = await params;
    const queryClient = getQueryClient();

    void queryClient.prefetchQuery(trpc.messages.getmany.queryOptions({
        projectId
    }));

    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
        id: projectId
    }));

    const dehydratedState = dehydrate(queryClient);

    return (
        <HydrationBoundary state={dehydratedState}>
            <ProjectViews projectId={projectId} />
        </HydrationBoundary>
    );
};

export default ProjectPage;