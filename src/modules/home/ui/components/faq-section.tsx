"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const handleGetPlanClick = () => {
    // Trigger highlight event for MainFeaturesSection
    window.dispatchEvent(new CustomEvent('highlight-fitness-form'));
  };

  const faqs = [
    {
      question: "Jak funguje AI fitness trenér?",
      answer: "Náš AI trenér analyzuje vaše cíle, zkušenosti, vybavení a časové možnosti, aby vytvořil personalizovaný tréninkový plán. Plán se automaticky upravuje podle vašeho pokroku a poskytuje odborné vedení jako skutečný trenér."
    },
    {
      question: "Je aplikace vhodná pro začátečníky?",
      answer: "Ano! Naše AI je navržena tak, aby pomáhala uživatelům všech úrovní. Pro začátečníky vytváříme základní plány s postupným zvyšováním obtížnosti, včetně detailních instrukcí a bezpečnostních doporučení."
    },
    {
      question: "Jak dlouho trvá vytvoření mého plánu?",
      answer: "Váš personalizovaný fitness plán je vytvořen během 5 minut! Stačí vyplnit krátký dotazník o vašich cílech, zkušenostech a preferencích, a AI okamžitě vygeneruje plán na míru."
    },
    {
      question: "Můžu upravit svůj tréninkový plán?",
      answer: "Samozřejmě! Váš plán je plně přizpůsobitelný. Můžete měnit cviky, upravovat intenzitu, přidávat nebo odebírat tréninky podle vašich potřeb. AI také automaticky upravuje plán na základě vašeho pokroku."
    },
    {
      question: "Jaké vybavení potřebuji?",
      answer: "Naše AI vytváří plány pro všechny úrovně vybavení - od cvičení bez vybavení až po plně vybavené fitness centrum. Můžete si vybrat, jaké vybavení máte k dispozici, a plán bude přizpůsoben."
    },
    {
      question: "Je aplikace bezpečná pro lidi se zdravotními problémy?",
      answer: "Bezpečnost je naší prioritou. AI bere v úvahu vaše zranění, zdravotní stav a úroveň zkušeností. Pro lidi se zdravotními problémy doporučujeme konzultaci s lékařem před začátkem tréninku."
    },
    {
      question: "Jak sledujete můj pokrok?",
      answer: "Sledujeme váš pokrok pomocí různých metrik - váha, síla, vytrvalost, dodržování plánu. Máte přístup k detailním grafům a analýzám, které vám pomohou vidět vaše zlepšení v čase."
    },
    {
      question: "Je aplikace zdarma?",
      answer: "Nabízíme 100% transparentní demo ukázku plně funkčního účtu zdarma, kde můžete vidět všechny funkce v akci před registrací. Pro plný přístup k personalizovaným plánům a sledování pokroku je potřeba předplatné."
    },
    {
      question: "Jak transparentní je vaše služba?",
      answer: "Jsme 100% transparentní - nabízíme demo účet s reálnými ukázkami vygenerovaných plánů, jídelníčků a funkcí. Můžete si vše prohlédnout před registrací, žádné skryté poplatky nebo překvapení."
    },
    {
      question: "Můžu získat i jídelníček?",
      answer: "Ano! Naše AI může vytvořit i personalizovaný jídelníček odpovídající vašim fitness cílům. Zahrnuje recepty, nákupní seznamy a nutriční poradenství pro optimální výsledky."
    },
    {
      question: "Jak často se plán aktualizuje?",
      answer: "Plán se automaticky aktualizuje každé 4-6 týdnů na základě vašeho pokroku, nebo kdykoliv si to přejete. AI analyzuje vaše výsledky a upravuje obtížnost a cviky pro maximální efektivitu."
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-8 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Často kladené otázky
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Odpovědi na nejčastější otázky o našem AI fitness trenérovi a jak vám může pomoci dosáhnout vašich cílů.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-6"
            >
              <AccordionTrigger className="text-left font-semibold text-lg hover:text-green-600 transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Stále máte otázky?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@fitnessai.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Kontaktujte podporu
            </a>
            <a
              href="/help"
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Návody a tipy
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}