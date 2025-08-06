import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentData } = body;

    if (!assessmentData) {
      return NextResponse.json({ error: "Assessment data is required" }, { status: 400 });
    }

    // Send event to Inngest to regenerate meal plan
    const result = await inngest.send({
      name: "regenerate-meal-plan/run",
      data: {
        userId,
        assessmentData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Meal plan regeneration started",
      eventId: result.ids[0],
    });

  } catch (error) {
    console.error("Error regenerating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to regenerate meal plan" },
      { status: 500 }
    );
  }
}