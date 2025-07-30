-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "downloadedAt" TIMESTAMP(3),
ADD COLUMN     "downloadedBy" TEXT;
