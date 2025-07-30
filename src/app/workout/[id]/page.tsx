import { WorkoutView } from "./workout-view";
import { getQueryClient, trpc } from "@/trcp/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    demo?: string;
  }>;
};

const WorkoutPage = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const { demo } = await searchParams;
  const queryClient = getQueryClient();

  // Use appropriate procedure based on demo parameter
  if (demo === "true") {
    void queryClient.prefetchQuery(trpc.fitness.getPublicWorkout.queryOptions({
      workoutId: id
    }));
  } else {
    void queryClient.prefetchQuery(trpc.fitness.getWorkout.queryOptions({
      workoutId: id
    }));
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <WorkoutView workoutId={id} />
    </HydrationBoundary>
  );
};

export default WorkoutPage;