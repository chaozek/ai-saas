import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trcp/client";

export function useRegenerateMealPlan() {
  const trpc = useTRPC();

  const { mutate, isPending, error } = useMutation(trpc.fitness.regenerateMealPlan.mutationOptions({
    onSuccess: () => {
      toast.success("Jídelníček se regeneruje...");
    },
    onError: (error: any) => {
      toast.error(`Chyba při regeneraci jídelníčku: ${error.message}`);
    },
  }));

  return {
    regenerateMealPlan: mutate,
    isLoading: isPending,
    error,
  };
}