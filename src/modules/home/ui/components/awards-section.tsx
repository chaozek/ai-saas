import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

export function AwardsSection() {
  const awards = [
    { name: "Forbes 2024", category: "Nejlepší AI trenér" },
    { name: "TechCrunch", category: "Inovace roku" },
    { name: "Fitness Awards", category: "Platforma roku" },
    { name: "AI Summit", category: "Nejlepší UX" },
    { name: "Health Tech", category: "Personalizace" },
    { name: "Startup Weekly", category: "Růst roku" }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <h2 className="text-2xl lg:text-3xl font-bold">
            Nejlepší <span className="text-green-600">AI fitness platforma</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {awards.map((award, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold text-sm">{award.name}</p>
                  <p className="text-xs text-muted-foreground">{award.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}