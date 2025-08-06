-- CreateTable
CREATE TABLE "czech_foods" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "englishName" TEXT,
    "scientificName" TEXT,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION,
    "sugar" DOUBLE PRECISION,
    "water" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "edible" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "czech_foods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "czech_foods_code_key" ON "czech_foods"("code");

-- CreateIndex
CREATE INDEX "czech_foods_name_idx" ON "czech_foods"("name");

-- CreateIndex
CREATE INDEX "czech_foods_calories_idx" ON "czech_foods"("calories");

-- CreateIndex
CREATE INDEX "czech_foods_protein_idx" ON "czech_foods"("protein");
