import { WorkoutView } from "./workout-view";
import { getQueryClient, trpc } from "@/trcp/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const WorkoutPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.fitness.getWorkout.queryOptions({
    workoutId: id
  }));

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <WorkoutView workoutId={id} />
    </HydrationBoundary>
  );
};

export default WorkoutPage;