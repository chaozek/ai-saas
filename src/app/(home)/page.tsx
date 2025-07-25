import {
  HeroSection,
  AwardsSection,
  MainFeaturesSection,
  TestimonialsSection,
  EducationalContentSection,
  MobileAppSection,
  FinalCTASection,
  FAQSection,
  FitnessFeatures
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
      <MobileAppSection />
      <FinalCTASection />
    </div>
  );
}
