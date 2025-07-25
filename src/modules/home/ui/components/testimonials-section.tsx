import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  const reviews = [
    {
      name: "Martin K.",
      role: "Začátečník",
      content: "Za 3 měsíce jsem zhubl 15kg a cítím se skvěle. AI plán byl perfektní!",
      rating: 5,
      avatar: "💪",
      achievement: "15kg zhubl"
    },
    {
      name: "Anna S.",
      role: "Pokročilá",
      content: "Konečně trenér, který rozumí mým cílům. Výsledky jsou úžasné.",
      rating: 5,
      avatar: "🏃‍♀️",
      achievement: "20% silnější"
    },
    {
      name: "Petr M.",
      role: "Sportovec",
      content: "Profesionální přístup, personalizované plány. Doporučuji všem!",
      rating: 5,
      avatar: "🏋️‍♂️",
      achievement: "Maraton dokončen"
    },
    {
      name: "Lucie V.",
      role: "Maminka",
      content: "Skvělý způsob, jak se dostat zpět do formy po porodu. Plány jsou flexibilní.",
      rating: 5,
      avatar: "👩‍👧‍👦",
      achievement: "Zpět do formy"
    },
    {
      name: "Tomáš H.",
      role: "Kancelářský pracovník",
      content: "Díky AI trenérovi jsem konečně našel čas na cvičení. Výsledky jsou viditelné!",
      rating: 5,
      avatar: "💼",
      achievement: "10kg zhubl"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Spokojených uživatelů" },
    { number: "95%", label: "Úspěšnost cílů" },
    { number: "4.9/5", label: "Hodnocení aplikace" },
    { number: "24/7", label: "AI podpora" }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Připojte se k <span className="text-green-600">50,000+</span> uživatelům
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Lidé z celého světa již transformovali svou fitness cestu s naším AI trenérem
            </p>
          </div>

          {/* Testimonials Slider */}
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-4xl mx-auto"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {reviews.map((review, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm mb-4 italic">"{review.content}"</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-lg">
                            {review.avatar}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.role}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Badge variant="secondary" className="text-xs">
                            {review.achievement}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}