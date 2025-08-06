/*
  Warnings:

  - The values [SUPPLEMENT] on the enum `MealType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `budgetPerWeek` on the `FitnessProfile` table. All the data in the column will be lost.
  - You are about to drop the column `cookingSkill` on the `FitnessProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mealPrepTime` on the `FitnessProfile` table. All the data in the column will be lost.
  - You are about to drop the column `cookTime` on the `Meal` table. All the data in the column will be lost.
  - You are about to drop the column `prepTime` on the `Meal` table. All the data in the column will be lost.
  - You are about to drop the column `budgetPerWeek` on the `MealPlan` table. All the data in the column will be lost.
  - You are about to drop the column `cookTime` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `prepTime` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MealType_new" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');
ALTER TABLE "Meal" ALTER COLUMN "mealType" TYPE "MealType_new" USING ("mealType"::text::"MealType_new");
ALTER TYPE "MealType" RENAME TO "MealType_old";
ALTER TYPE "MealType_new" RENAME TO "MealType";
DROP TYPE "MealType_old";
COMMIT;

-- AlterTable
ALTER TABLE "FitnessProfile" DROP COLUMN "budgetPerWeek",
DROP COLUMN "cookingSkill",
DROP COLUMN "mealPrepTime";

-- AlterTable
ALTER TABLE "Meal" DROP COLUMN "cookTime",
DROP COLUMN "prepTime";

-- AlterTable
ALTER TABLE "MealPlan" DROP COLUMN "budgetPerWeek";

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "cookTime",
DROP COLUMN "prepTime";
