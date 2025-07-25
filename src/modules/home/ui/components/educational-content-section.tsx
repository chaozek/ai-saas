import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, BookOpen, TrendingUp } from "lucide-react";

export function EducationalContentSection() {
  const courses = [
    { title: "Fitness pro začátečníky", icon: Target },
    { title: "Rozhovory s trenéry", icon: Users },
    { title: "Výživa a stravování", icon: BookOpen },
    { title: "Pokročilé techniky", icon: TrendingUp }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Fitness vzdělávání a kurzy
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Akademie FitnessAI nabízí bezplatné, profesionální fitness vzdělávání všech úrovní
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <course.icon className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">Bezplatný kurz</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}