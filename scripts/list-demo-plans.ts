import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('📋 Listing demo plans...')

  const demoPlans = await prisma.workoutPlan.findMany({
    where: {
      isPublic: true,
    },
    include: {
      fitnessProfile: {
        select: {
          id: true,
          gender: true,
          fitnessGoal: true,
        },
      },
    },
  })

  console.log(`Found ${demoPlans.length} demo plans:\n`)

  demoPlans.forEach((plan, index) => {
    console.log(`${index + 1}. Workout Plan ID: ${plan.id}`)
    console.log(`   Name: ${plan.name}`)
    console.log(`   Profile ID: ${plan.fitnessProfile.id}`)
    console.log(`   Gender: ${plan.fitnessProfile.gender}`)
    console.log(`   Goal: ${plan.fitnessProfile.fitnessGoal}`)
    console.log('')
  })
}

main()
  .catch((e) => {
    console.error('❌ Error listing demo plans:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })