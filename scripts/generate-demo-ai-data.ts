import { PrismaClient, FitnessGoal, ActivityLevel, ExperienceLevel } from '../src/generated/prisma'
import { inngest } from '../src/inngest/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🤖 Creating demo plans with AI data...')

  // Create demo users
  const demoUsers = [
    { id: 'demo-user-male-muscle', name: 'Demo Muž - Svaly' },
    { id: 'demo-user-male-weight', name: 'Demo Muž - Hubnutí' },
    { id: 'demo-user-female-muscle', name: 'Demo Žena - Svaly' },
    { id: 'demo-user-female-weight', name: 'Demo Žena - Hubnutí' },
  ]

  for (const userData of demoUsers) {
    await prisma.user.upsert({
      where: { id: userData.id },
      update: {},
      create: { id: userData.id }
    })
    console.log(`✅ Demo user created: ${userData.id}`)
  }

  // Create demo fitness profiles for different scenarios
  const demoProfiles = [
    {
      id: 'demo-profile-male-muscle',
      userId: 'demo-user-male-muscle',
      gender: 'male',
      fitnessGoal: FitnessGoal.MUSCLE_GAIN,
      age: 28,
      weight: 75,
      height: 180,
      targetWeight: 80,
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      availableDays: JSON.stringify(['Pondělí', 'Úterý', 'Čtvrtek', 'Pátek']),
      workoutDuration: 60,
      equipment: JSON.stringify(['Činky', 'Posilovací lavice', 'Kettlebell']),
      mealPlanningEnabled: true,
      dietaryRestrictions: [],
      allergies: [],
      budgetPerWeek: 1000,
      mealPrepTime: 30,
      preferredCuisines: ['česká', 'italská', 'asijská'],
      cookingSkill: ExperienceLevel.INTERMEDIATE,
      isPublic: true,
    },
 /*    {
      id: 'demo-profile-male-weight',
      userId: 'demo-user-male-weight',
      gender: 'male',
      fitnessGoal: FitnessGoal.WEIGHT_LOSS,
      age: 32,
      weight: 85,
      height: 175,
      targetWeight: 75,
      experienceLevel: ExperienceLevel.BEGINNER,
      activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
      availableDays: JSON.stringify(['Pondělí', 'Středa', 'Pátek']),
      workoutDuration: 45,
      equipment: JSON.stringify(['Činky', 'Gym ball', 'Resistance bands']),
      mealPlanningEnabled: true,
      dietaryRestrictions: [],
      allergies: [],
      budgetPerWeek: 800,
      mealPrepTime: 20,
      preferredCuisines: ['česká', 'středomořská'],
      cookingSkill: ExperienceLevel.BEGINNER,
      isPublic: true,
    },
    {
      id: 'demo-profile-female-muscle',
      userId: 'demo-user-female-muscle',
      gender: 'female',
      fitnessGoal: FitnessGoal.MUSCLE_GAIN,
      age: 25,
      weight: 60,
      height: 165,
      targetWeight: 65,
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      availableDays: JSON.stringify(['Pondělí', 'Úterý', 'Čtvrtek']),
      workoutDuration: 50,
      equipment: JSON.stringify(['Činky', 'Gym ball', 'Resistance bands', 'Kettlebell']),
      mealPlanningEnabled: true,
      dietaryRestrictions: ['vegetariánská'],
      allergies: [],
      budgetPerWeek: 900,
      mealPrepTime: 25,
      preferredCuisines: ['česká', 'italská', 'vegetariánská'],
      cookingSkill: ExperienceLevel.INTERMEDIATE,
      isPublic: true,
    },
    {
      id: 'demo-profile-female-weight',
      userId: 'demo-user-female-weight',
      gender: 'female',
      fitnessGoal: FitnessGoal.WEIGHT_LOSS,
      age: 29,
      weight: 70,
      height: 160,
      targetWeight: 60,
      experienceLevel: ExperienceLevel.BEGINNER,
      activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
      availableDays: JSON.stringify(['Pondělí', 'Středa', 'Pátek', 'Sobota']),
      workoutDuration: 40,
      equipment: JSON.stringify(['Gym ball', 'Resistance bands', 'Yoga mat']),
      mealPlanningEnabled: true,
      dietaryRestrictions: [],
      allergies: ['ořechy'],
      budgetPerWeek: 700,
      mealPrepTime: 15,
      preferredCuisines: ['česká', 'asijská'],
      cookingSkill: ExperienceLevel.BEGINNER,
      isPublic: true,
    } */
  ]

  const createdPlans = []

  for (const profileData of demoProfiles) {
    const profile = await prisma.fitnessProfile.upsert({
      where: { id: profileData.id },
      update: {},
      create: {
        ...profileData,
      },
    })
    console.log(`✅ Demo profile created: ${profile.id} (${profileData.gender} - ${profileData.fitnessGoal})`)

    // Create workout plan
    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        name: `Demo plán - ${profileData.gender === 'male' ? 'Muž' : 'Žena'} - ${profileData.fitnessGoal === FitnessGoal.MUSCLE_GAIN ? 'Nabírání svalů' : 'Hubnutí'}`,
        description: `Personalizovaný ${profileData.fitnessGoal === FitnessGoal.MUSCLE_GAIN ? 'silový' : 'kardio'} program pro ${profileData.gender === 'male' ? 'muže' : 'ženy'} zaměřený na ${profileData.fitnessGoal === FitnessGoal.MUSCLE_GAIN ? 'růst svalové hmoty' : 'spalování tuků'}`,
        duration: 8,
        difficulty: profileData.experienceLevel,
        isActive: true,
        isPublic: true,
        fitnessProfileId: profile.id,
      },
    })
    console.log(`✅ Workout plan created: ${workoutPlan.id}`)

    // Note: Meal plans will be created by AI generation with precise nutrition calculations
    console.log(`ℹ️ Meal plan will be created by AI generation with precise nutrition calculations`)

    createdPlans.push({ workoutPlan, profile })
  }

  console.log(`\n🎉 Created ${createdPlans.length} demo plans!`)
  console.log('🤖 Now triggering AI generation for all plans...')

  // Get all demo workout plans
  const demoPlans = await prisma.workoutPlan.findMany({
    where: {
      isPublic: true,
    },
    include: {
      fitnessProfile: true,
    },
  })

  console.log(`Found ${demoPlans.length} demo plans to process`)

  for (const plan of demoPlans) {
    console.log(`\n🔄 Processing demo plan: ${plan.name}`)
    console.log(`Profile: ${plan.fitnessProfile.gender} - ${plan.fitnessProfile.fitnessGoal}`)

    // Prepare assessment data for AI generation
    const assessmentData = {
      age: plan.fitnessProfile.age?.toString() || '25',
      gender: plan.fitnessProfile.gender || 'male',
      height: plan.fitnessProfile.height?.toString() || '170',
      weight: plan.fitnessProfile.weight?.toString() || '70',
      targetWeight: plan.fitnessProfile.targetWeight?.toString() || '70',
      fitnessGoal: plan.fitnessProfile.fitnessGoal || FitnessGoal.GENERAL_FITNESS,
      activityLevel: plan.fitnessProfile.activityLevel || ActivityLevel.MODERATELY_ACTIVE,
      experienceLevel: plan.fitnessProfile.experienceLevel || ExperienceLevel.BEGINNER,
      targetMuscleGroups: plan.fitnessProfile.targetMuscleGroups || [],
      hasInjuries: plan.fitnessProfile.hasInjuries || false,
      injuries: plan.fitnessProfile.injuries || '',
      medicalConditions: plan.fitnessProfile.medicalConditions || '',
      availableDays: plan.fitnessProfile.availableDays ? JSON.parse(plan.fitnessProfile.availableDays) : ['Pondělí', 'Středa', 'Pátek'],
      workoutDuration: plan.fitnessProfile.workoutDuration || 45,
      preferredExercises: plan.fitnessProfile.preferredExercises || '',
      equipment: plan.fitnessProfile.equipment ? JSON.parse(plan.fitnessProfile.equipment) : ['Činky'],
      // Meal planning data
      mealPlanningEnabled: plan.fitnessProfile.mealPlanningEnabled || true,
      dietaryRestrictions: plan.fitnessProfile.dietaryRestrictions || [],
      allergies: plan.fitnessProfile.allergies || [],
      budgetPerWeek: plan.fitnessProfile.budgetPerWeek || 1000,
      mealPrepTime: plan.fitnessProfile.mealPrepTime || 30,
      preferredCuisines: plan.fitnessProfile.preferredCuisines || ['česká', 'italská'],
      cookingSkill: plan.fitnessProfile.cookingSkill || ExperienceLevel.INTERMEDIATE,
    }

    try {
      // Trigger AI generation for this demo plan
      const result = await inngest.send({
        name: "generate-fitness-plan/run",
        data: {
          assessmentData,
          userId: plan.fitnessProfile.userId,
          workoutPlanId: plan.id,
        },
      })

      console.log(`✅ AI generation triggered for plan ${plan.id}`)
      console.log(`Event ID: ${result.ids[0]}`)

      // Wait a bit between plans to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error) {
      console.error(`❌ Error generating AI data for plan ${plan.id}:`, error)
    }
  }

  console.log('\n🎉 AI generation triggered for all demo plans!')
  console.log('Note: AI generation runs in the background. Check Inngest dashboard for progress.')
}

main()
  .catch((e) => {
    console.error('❌ Error in demo AI generation:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })