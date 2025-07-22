import { Message } from "@inngest/agent-kit";

export const getAssessmentData = (assessmentString: string) => {
  try {
    return JSON.parse(decodeURIComponent(assessmentString));
  } catch (error) {
    console.error('Error parsing assessment data:', error);
    return null;
  }
};

export const generateFitnessPlan = async (assessmentData: any) => {
  // This function would integrate with AI to generate a personalized fitness plan
  // For now, we'll return a basic structure
  return {
    name: `${assessmentData.fitnessGoal.replace('_', ' ')} Plan`,
    description: `Personalized ${assessmentData.fitnessGoal.toLowerCase().replace('_', ' ')} program`,
    duration: 8,
    difficulty: assessmentData.experienceLevel,
    workouts: []
  };
};

export const lastAssistantTextMessageContent = (result: any): string | null => {
  if (!result || !result.messages || !Array.isArray(result.messages)) {
    return null;
  }

  // Find the last assistant message
  for (let i = result.messages.length - 1; i >= 0; i--) {
    const message = result.messages[i];
    if (message.role === "assistant" && message.type === "text") {
      return message.content;
    }
  }

  return null;
};