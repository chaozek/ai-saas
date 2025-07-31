"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { useTRPC } from "@/trcp/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function EmailTest() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Test Email");
  const [message, setMessage] = useState("This is a test email from FitnessAI");

  // Workout reminder test data
  const [workoutName, setWorkoutName] = useState("Upper Body Strength");
  const [workoutDuration, setWorkoutDuration] = useState("45 minut");
  const [targetMuscles, setTargetMuscles] = useState("Hrudník, Triceps, Ramena");

  // Progress update test data
  const [currentWeight, setCurrentWeight] = useState(75);
  const [targetWeight, setTargetWeight] = useState(70);
  const [progressPercentage, setProgressPercentage] = useState(60);
  const [daysActive, setDaysActive] = useState(14);
  const [workoutsCompleted, setWorkoutsCompleted] = useState(8);

  const trpc = useTRPC();

  const testEmail = useMutation(trpc.email.testEmail.mutationOptions({
    onSuccess: () => {
      toast.success("Test email sent successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to send email: ${error.message}`);
    },
  }));

  const sendWorkoutReminder = useMutation(trpc.email.testWorkoutReminder.mutationOptions({
    onSuccess: () => {
      toast.success("Workout reminder email sent successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to send workout reminder: ${error.message}`);
    },
  }));

  const sendProgressUpdate = useMutation(trpc.email.testProgressUpdate.mutationOptions({
    onSuccess: () => {
      toast.success("Progress update email sent successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to send progress update: ${error.message}`);
    },
  }));

  const handleSendTestEmail = () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    testEmail.mutate({
      to: email,
      subject,
      message,
    });
  };

  const handleSendWorkoutReminder = () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    sendWorkoutReminder.mutate({
      to: email,
      userName: "Test User",
      workoutName,
      workoutDuration,
      targetMuscles: targetMuscles.split(", "),
    });
  };

  const handleSendProgressUpdate = () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    sendProgressUpdate.mutate({
      to: email,
      userName: "Test User",
      currentWeight,
      targetWeight,
      progressPercentage,
      daysActive,
      workoutsCompleted,
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🎨 Cool Email Templates Test</CardTitle>
        <CardDescription>
          Test all the beautiful email templates with Resend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Test</TabsTrigger>
              <TabsTrigger value="workout">Workout Reminder</TabsTrigger>
              <TabsTrigger value="progress">Progress Update</TabsTrigger>
              <TabsTrigger value="templates">Template Info</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendTestEmail}
                disabled={testEmail.isPending}
                className="w-full"
              >
                {testEmail.isPending ? "Sending..." : "Send Basic Test Email"}
              </Button>
            </TabsContent>

            <TabsContent value="workout" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workoutName">Workout Name</Label>
                <Input
                  id="workoutName"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workoutDuration">Duration</Label>
                <Input
                  id="workoutDuration"
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetMuscles">Target Muscles (comma separated)</Label>
                <Input
                  id="targetMuscles"
                  value={targetMuscles}
                  onChange={(e) => setTargetMuscles(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendWorkoutReminder}
                disabled={sendWorkoutReminder.isPending}
                className="w-full"
              >
                {sendWorkoutReminder.isPending ? "Sending..." : "Send Workout Reminder"}
              </Button>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="progressPercentage">Progress Percentage</Label>
                <Input
                  id="progressPercentage"
                  type="number"
                  value={progressPercentage}
                  onChange={(e) => setProgressPercentage(Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daysActive">Days Active</Label>
                  <Input
                    id="daysActive"
                    type="number"
                    value={daysActive}
                    onChange={(e) => setDaysActive(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workoutsCompleted">Workouts Completed</Label>
                  <Input
                    id="workoutsCompleted"
                    type="number"
                    value={workoutsCompleted}
                    onChange={(e) => setWorkoutsCompleted(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button
                onClick={handleSendProgressUpdate}
                disabled={sendProgressUpdate.isPending}
                className="w-full"
              >
                {sendProgressUpdate.isPending ? "Sending..." : "Send Progress Update"}
              </Button>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🎉 Welcome Email</h4>
                  <p className="text-blue-700 text-sm">
                    Beautiful gradient design with animated elements, feature cards, and statistics.
                    Automatically sent when users register.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Payment Confirmation</h4>
                  <p className="text-green-700 text-sm">
                    Professional payment confirmation with order details, animated checkmark,
                    and feature highlights. Sent after successful payments.
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">💪 Workout Reminder</h4>
                  <p className="text-orange-700 text-sm">
                    Energetic design with workout details, muscle group tags, and motivational elements.
                    Perfect for scheduled workout reminders.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">📊 Progress Update</h4>
                  <p className="text-purple-700 text-sm">
                    Interactive progress visualization with circular progress indicator,
                    statistics grid, and achievement highlights.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}