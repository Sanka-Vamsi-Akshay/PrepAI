-- CreateEnum
CREATE TYPE "CompanyProfile" AS ENUM ('GOOGLE', 'AMAZON', 'MICROSOFT', 'META', 'TCS', 'INFOSYS', 'WIPRO', 'ACCENTURE', 'STARTUP');

-- AlterEnum
ALTER TYPE "Difficulty" ADD VALUE 'EASY_MEDIUM';
ALTER TYPE "Difficulty" ADD VALUE 'MEDIUM_HARD';

-- AlterTable
ALTER TABLE "interview_sessions" ADD COLUMN "company_profile" "CompanyProfile";

-- AlterTable
ALTER TABLE "analytics_snapshots" ADD COLUMN "company_readiness" JSONB,
ADD COLUMN "strongest_company_profile" TEXT,
ADD COLUMN "weakest_company_profile" TEXT;
