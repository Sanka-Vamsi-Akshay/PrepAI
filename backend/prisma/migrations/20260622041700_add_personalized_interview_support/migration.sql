-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('STANDARD', 'PERSONALIZED');

-- AlterTable
ALTER TABLE "interview_evaluations" ADD COLUMN     "confidence_score" DOUBLE PRECISION,
ADD COLUMN     "consistency_score" DOUBLE PRECISION,
ADD COLUMN     "resume_alignment_score" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "interview_sessions" ADD COLUMN     "interview_type" "InterviewType" NOT NULL DEFAULT 'STANDARD';
