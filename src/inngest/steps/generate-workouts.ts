import { PrismaClient } from "../../generated/prisma";
import { findExistingExercise, createExerciseData } from "../utils";
import { generateWorkoutWithAI } from "../ai-generation";

export async function generateWorkouts(prisma: PrismaClient, workoutPlanId: string, assessmentData: any) {
  console.log("Starting workout generation step...");

  // Parse availableDays - it might be a JSON string from the database
  let availableDays = assessmentData.availableDays;
  if (typeof availableDays === 'string') {
    try {
      availableDays = JSON.parse(availableDays);
    } catch (error) {
      console.error('Failed to parse availableDays:', error);
      throw new Error(`Failed to parse availableDays: ${availableDays}`);
    }
  }

  const workoutDuration = parseInt(assessmentData.workoutDuration);

  console.log(`Available days:`, availableDays);
  console.log(`Generating ${availableDays.length} workout templates for days: ${availableDays.join(', ')}`);

  // Generate workout templates for each day (only once, not per week)
  const workoutTemplates: { [day: string]: any } = {};

  for (let dayIndex = 0; dayIndex < availableDays.length; dayIndex++) {
    const day = availableDays[dayIndex];

    // Generate workout template using AI (only once per day)
    const aiWorkout = await generateWorkoutWithAI(
      1, // Use week 1 as template
      day,
      assessmentData.fitnessGoal,
      assessmentData.experienceLevel,
      assessmentData.equipment,
      workoutDuration,
      assessmentData.hasInjuries,
      assessmentData.injuries,
      assessmentData.medicalConditions,
      assessmentData.age,
      assessmentData.gender,
      assessmentData.height,
      assessmentData.weight,
      assessmentData.targetWeight,
      assessmentData.activityLevel,
      assessmentData.preferredExercises,
      assessmentData.targetMuscleGroups
    );

    workoutTemplates[day] = aiWorkout;
    console.log(`Generated template for ${day}: ${aiWorkout.name} with ${aiWorkout.exercises?.length || 0} exercises`);
  }

  // Create workouts for each week using the templates
  let totalExercises = 0;
  let reusedExercises = 0;
  let newExercises = 0;
  let sessionExercises = 0;

  // Track exercises created in this session to prevent duplicates within the same generation
  const sessionExerciseMap = new Map<string, any>();

  // Create workouts sequentially to ensure proper session-level deduplication
  const createdWorkouts = [];

  for (let week = 1; week <= 8; week++) {
    for (let dayIndex = 0; dayIndex < availableDays.length; dayIndex++) {
      const day = availableDays[dayIndex];
      const dayIndexNum = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
      const template = workoutTemplates[day];

      // Create the workout first
      const workout = await prisma.workout.create({
        data: {
          name: `Week ${week} - ${template.name}`,
          description: template.description,
          dayOfWeek: dayIndexNum,
          weekNumber: week,
          duration: workoutDuration,
          workoutPlanId: workoutPlanId,
        },
      });

      console.log(`Created workout: ${workout.name} (ID: ${workout.id}) for plan ${workoutPlanId} with ${template.exercises?.length || 0} exercises`);

      // Process exercises with many-to-many relationship
      for (const exercise of template.exercises) {
        totalExercises++;

        // Create a simple key based on exercise name only
        const exerciseKey = exercise.name.toLowerCase().trim();

        let exerciseRecord;

        // First check if we already created this exercise in this session
        if (sessionExerciseMap.has(exerciseKey)) {
          sessionExercises++;
          exerciseRecord = sessionExerciseMap.get(exerciseKey);
          console.log(`Reusing exercise from this session: "${exercise.name}" (ID: ${exerciseRecord.id})`);
        } else {
          // Check if exercise already exists in database
          const existingExercise = await findExistingExercise(prisma, exercise.name, exercise.englishName);

          if (existingExercise) {
            reusedExercises++;
            console.log(`Reusing existing exercise from database: "${exercise.name}" (ID: ${existingExercise.id}) - skipping YouTube validation`);
            exerciseRecord = existingExercise;
          } else {
            newExercises++;
            console.log(`Creating new exercise: "${exercise.name}" (English: "${exercise.englishName}") - will validate YouTube URL`);

            // Create new exercise (without workoutId - it's now separate)
            const exerciseData = createExerciseData(exercise);
            exerciseRecord = await prisma.exercise.create({
              data: {
                name: exerciseData.name,
                englishName: exerciseData.englishName,
                description: exerciseData.description,
                category: exerciseData.category,
                muscleGroups: exerciseData.muscleGroups,
                equipment: exerciseData.equipment,
                difficulty: exerciseData.difficulty,
                youtubeUrl: exerciseData.youtubeUrl,
              }
            });
          }

          // Store in session map for future reuse
          sessionExerciseMap.set(exerciseKey, exerciseRecord);
        }

        // Create the workout-exercise relationship with workout-specific parameters
        await prisma.workoutExercise.create({
          data: {
            workoutId: workout.id,
            exerciseId: exerciseRecord.id,
            sets: exercise.sets || null,
            reps: exercise.reps || null,
            duration: exercise.duration || null,
            restTime: exercise.restTime || null,
            weight: exercise.weight || null,
          }
        });
      }

      createdWorkouts.push(workout);
    }
  }
  console.log(`Created ${createdWorkouts.length} workouts using ${availableDays.length} AI-generated templates for plan ${workoutPlanId}`);

  // Log exercise deduplication statistics
  console.log(`Exercise deduplication summary:`);
  console.log(`  Total exercises processed: ${totalExercises}`);
  console.log(`  Reused existing exercises from database: ${reusedExercises} (${((reusedExercises / totalExercises) * 100).toFixed(1)}%)`);
  console.log(`  Reused exercises from this session: ${sessionExercises} (${((sessionExercises / totalExercises) * 100).toFixed(1)}%)`);
  console.log(`  Created new exercises: ${newExercises} (${((newExercises / totalExercises) * 100).toFixed(1)}%)`);
  console.log(`  Total deduplication savings: ${reusedExercises + sessionExercises} exercises (${(((reusedExercises + sessionExercises) / totalExercises) * 100).toFixed(1)}%)`);
  console.log(`  YouTube API calls saved: ${reusedExercises + sessionExercises} (reused exercises already have validated URLs)`);

  // Verify workouts were created
  const workoutCount = await prisma.workout.count({
    where: { workoutPlanId: workoutPlanId }
  });
  console.log(`Total workouts in database for plan ${workoutPlanId}: ${workoutCount}`);

  // Verify the workout plan has workouts
  const finalWorkoutPlan = await prisma.workoutPlan.findUnique({
    where: { id: workoutPlanId },
    include: {
      workouts: {
        include: {
          workoutExercises: {
            include: {
              exercise: true
            }
          }
        }
      }
    }
  });
  console.log(`Final workout plan state:`, {
    id: finalWorkoutPlan?.id,
    name: finalWorkoutPlan?.name,
    workoutCount: finalWorkoutPlan?.workouts?.length || 0,
    totalExercises: finalWorkoutPlan?.workouts?.reduce((total, w) => total + (w.workoutExercises?.length || 0), 0) || 0
  });
}