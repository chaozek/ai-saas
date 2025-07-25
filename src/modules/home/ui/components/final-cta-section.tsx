import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl lg:text-4xl font-bold">
          Připraveni transformovat vaši fitness cestu?
        </h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Připojte se k tisícům uživatelů, kteří již dosáhli svých fitness cílů s naším AI-powered koučovacím systémem.
        </p>
        <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
          Začněte zdarma ještě dnes
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}