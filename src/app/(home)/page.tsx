"use client"
import { Logo } from "@/components/ui/logo";
import { FitnessAssessmentForm } from "@/modules/home/ui/components/fitness-assessment-form";
import { FitnessFeatures } from "@/modules/home/ui/components/fitness-features";

export default function Page() {
  return (
    <div className="flex flex-col max-w-6xl mx-auto w-full">
      <section className="space-y-8 py-[12vh] 2xl:py-32">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
            <Logo alt="logo" width={150} height={75} />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Your Personal AI Fitness Coach
     </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Get a personalized workout plan tailored to your goals, experience level, and lifestyle.
              Our AI coach asks the right questions and creates the perfect plan for you.
     </p>
     </div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <FitnessAssessmentForm />
</div>

        <FitnessFeatures />
    </section>
    </div>
  );
}
