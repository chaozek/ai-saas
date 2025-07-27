import {
  HeroSection,
  AwardsSection,
  MainFeaturesSection,
  TestimonialsSection,
  EducationalContentSection,
  AITrainerFeaturesSection,
  FinalCTASection,
  FAQSection,
  FitnessFeatures,
  TrainerPriceBadge
} from "@/modules/home/ui/components";

export default function Page() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <AwardsSection />
      <MainFeaturesSection />
      <TestimonialsSection />
      <FitnessFeatures />
      <EducationalContentSection />
      <FAQSection />
      <AITrainerFeaturesSection />
      <FinalCTASection />

      {/* Trainer Price Badge Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
              Začni svou fitness cestu už dnes
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl">
              Náš AI trenér je připraven pomoci vám dosáhnout vašich fitness cílů.
              Jednorázová investice, která změní váš život.
            </p>
            <TrainerPriceBadge />
          </div>
        </div>
      </section>
    </div>
  );
}
