import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🍽️ Checking demo meal plans...')

  // Get all demo fitness profiles
  const demoProfiles = await prisma.fitnessProfile.findMany({
    where: {
      isPublic: true,
    },
    include: {
      mealPlans: {
        include: {
          meals: {
            include: {
              recipes: true,
            },
          },
        },
      },
    },
  })

  console.log(`Found ${demoProfiles.length} demo profiles`)

  for (const profile of demoProfiles) {
    console.log(`\n📋 Profile: ${profile.id}`)
    console.log(`   Gender: ${profile.gender}`)
    console.log(`   Goal: ${profile.fitnessGoal}`)
    console.log(`   Meal Planning Enabled: ${profile.mealPlanningEnabled}`)

    if (profile.mealPlans && profile.mealPlans.length > 0) {
      for (const mealPlan of profile.mealPlans) {
        console.log(`   🍽️ Meal Plan: ${mealPlan.name}`)
        console.log(`      ID: ${mealPlan.id}`)
        console.log(`      Is Public: ${mealPlan.isPublic}`)
        console.log(`      Is Active: ${mealPlan.isActive}`)
        console.log(`      Meals Count: ${mealPlan.meals?.length || 0}`)

        if (mealPlan.meals && mealPlan.meals.length > 0) {
          console.log(`      Sample Meals:`)
          mealPlan.meals.slice(0, 3).forEach((meal: any) => {
            console.log(`        - ${meal.name} (${meal.mealType})`)
          })
        } else {
          console.log(`      ❌ No meals found`)
        }
      }
    } else {
      console.log(`   ❌ No meal plans found`)
    }
  }

  console.log('\n🎉 Demo meal plan check completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error checking demo meal plans:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })