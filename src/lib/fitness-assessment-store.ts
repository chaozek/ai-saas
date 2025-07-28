import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AssessmentData {
  // Personal Information
  age: string;
  gender: string;
  height: string;
  weight: string;
  targetWeight?: string;

  // Fitness Goals
  fitnessGoal: "WEIGHT_LOSS" | "MUSCLE_GAIN" | "ENDURANCE" | "STRENGTH" | "FLEXIBILITY" | "GENERAL_FITNESS";
  activityLevel: "SEDENTARY" | "LIGHTLY_ACTIVE" | "MODERATELY_ACTIVE" | "VERY_ACTIVE" | "EXTREMELY_ACTIVE";
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

  // Target Muscle Groups
  targetMuscleGroups: string[];

  // Health Information
  hasInjuries: boolean;
  injuries?: string;
  medicalConditions?: string;

  // Preferences
  availableDays: string[];
  workoutDuration: string;
  preferredExercises?: string;
  equipment: string[];

  // Meal Planning
  mealPlanningEnabled: boolean;
  dietaryRestrictions: string[];
  allergies: string[];
  budgetPerWeek: string;
  mealPrepTime: string;
  preferredCuisines: string[];
  cookingSkill: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

  // Consent
  consent: boolean;
}

interface FitnessAssessmentStore {
  data: AssessmentData;
  currentStep: number;
  isSubmitting: boolean;
  trainerAnimation: boolean;
  pendingSubmission: boolean; // Flag to indicate if form was submitted but user wasn't authenticated
  hasHydrated: boolean; // Track if the store has been hydrated

  // Actions
  updateData: (field: keyof AssessmentData, value: any) => void;
  setCurrentStep: (step: number) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setTrainerAnimation: (animation: boolean) => void;
  setPendingSubmission: (pending: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  reset: () => void;
  nextStep: () => boolean;
  prevStep: () => void;
}

const initialData: AssessmentData = {
  age: "",
  gender: "",
  height: "",
  weight: "",
  targetWeight: "",
  fitnessGoal: "GENERAL_FITNESS",
  activityLevel: "SEDENTARY",
  experienceLevel: "BEGINNER",
  targetMuscleGroups: [],
  hasInjuries: false,
  injuries: "",
  medicalConditions: "",
  availableDays: [],
  workoutDuration: "45",
  preferredExercises: "",
  equipment: [],
  mealPlanningEnabled: false,
  dietaryRestrictions: [],
  allergies: [],
  budgetPerWeek: "1000",
  mealPrepTime: "30",
  preferredCuisines: [],
  cookingSkill: "BEGINNER",
  consent: false,
};

export const useFitnessAssessmentStore = create<FitnessAssessmentStore>()(
  persist(
    (set, get) => ({
      data: initialData,
      currentStep: 0,
      isSubmitting: false,
      trainerAnimation: false,
      pendingSubmission: false,
      hasHydrated: false,

      updateData: (field, value) => {
        set((state) => ({
          data: { ...state.data, [field]: value }
        }));
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      setIsSubmitting: (submitting) => {
        set({ isSubmitting: submitting });
      },

      setTrainerAnimation: (animation) => {
        set({ trainerAnimation: animation });
      },

      setPendingSubmission: (pending) => {
        set({ pendingSubmission: pending });
      },

      setHasHydrated: (hydrated) => {
        set({ hasHydrated: hydrated });
      },

      reset: () => {
        set({
          data: initialData,
          currentStep: 0,
          isSubmitting: false,
          trainerAnimation: false,
          pendingSubmission: false,
        });
      },

      nextStep: () => {
        const { currentStep, data } = get();
        // Check if we're on step 5 (preferences step) and validate available days
        if (currentStep === 5 && data.availableDays.length === 0) {
          return false; // Validation failed
        }

        if (currentStep < 6) { // 7 steps total (0-6)
          set((state) => ({ currentStep: state.currentStep + 1 }));
          return true;
        }
        return false;
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set((state) => ({ currentStep: state.currentStep - 1 }));
        }
      },
    }),
    {
      name: 'fitness-assessment-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist the data and currentStep, not the UI state
      partialize: (state) => ({
        data: state.data,
        currentStep: state.currentStep,
        pendingSubmission: state.pendingSubmission,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);