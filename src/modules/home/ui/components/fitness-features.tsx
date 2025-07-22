import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Shield,
  Users,
  Zap,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Personalization",
    description: "Our advanced AI analyzes your goals, experience, and preferences to create the perfect workout plan just for you.",
    badge: "Smart"
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Goal-Oriented Plans",
    description: "Whether you want to lose weight, build muscle, or improve endurance, we create plans that align with your specific objectives.",
    badge: "Focused"
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Progress Tracking",
    description: "Monitor your fitness journey with detailed progress logs, measurements, and performance analytics.",
    badge: "Analytics"
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Flexible Scheduling",
    description: "Workouts that fit your lifestyle. Choose your available days and preferred duration.",
    badge: "Adaptive"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Safety First",
    description: "We consider your injuries, medical conditions, and experience level to ensure safe and effective workouts.",
    badge: "Safe"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Expert Guidance",
    description: "Access to professional fitness knowledge and techniques, personalized for your level and equipment.",
    badge: "Expert"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Quick Assessment",
    description: "Get your personalized plan in minutes with our streamlined 5-step assessment process.",
    badge: "Fast"
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Comprehensive Dashboard",
    description: "View your workout plan, track progress, and manage your fitness journey all in one place.",
    badge: "Complete"
  }
];

export const FitnessFeatures = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Why Choose Our AI Fitness Coach?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the future of fitness with personalized AI coaching that adapts to your needs and helps you achieve your goals faster.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg group-hover:from-green-200 group-hover:to-blue-200 transition-colors">
                  {feature.icon}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {feature.badge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-green-800">
          Ready to Transform Your Fitness Journey?
        </h3>
        <p className="text-green-700 max-w-2xl mx-auto">
          Join thousands of users who have already achieved their fitness goals with our AI-powered coaching system.
          Start your personalized fitness journey today!
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-green-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>5-minute assessment</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Instant plan generation</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Free to start</span>
          </div>
        </div>
      </div>
    </div>
  );
};