-- CreateEnum
CREATE TYPE "CodingTopic" AS ENUM ('ARRAYS', 'STRINGS', 'HASHING', 'LINKED_LISTS', 'TREES', 'GRAPHS', 'DYNAMIC_PROGRAMMING', 'GREEDY', 'SQL');

-- CreateEnum
CREATE TYPE "CodingSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "analytics_snapshots" ADD COLUMN     "average_coding_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "coding_problems_solved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "coding_stats" JSONB;

-- CreateTable
CREATE TABLE "coding_problems" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "topic" "CodingTopic" NOT NULL,
    "starter_code_java" TEXT NOT NULL,
    "starter_code_py" TEXT NOT NULL,
    "starter_code_js" TEXT NOT NULL,
    "test_cases" JSONB NOT NULL,
    "hidden_test_cases" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "interview_session_id" TEXT,
    "coding_problem_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "starter_code" TEXT NOT NULL,
    "user_code" TEXT NOT NULL,
    "status" "CodingSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "difficulty" "Difficulty" NOT NULL,
    "execution_result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_evaluations" (
    "id" TEXT NOT NULL,
    "coding_session_id" TEXT NOT NULL,
    "correctness_score" INTEGER NOT NULL,
    "code_quality_score" INTEGER NOT NULL,
    "complexity_score" INTEGER NOT NULL,
    "optimization_score" INTEGER NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "topic" "CodingTopic" NOT NULL,
    "similarity_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "execution_passed" INTEGER NOT NULL DEFAULT 0,
    "execution_failed" INTEGER NOT NULL DEFAULT 0,
    "strengths" TEXT NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coding_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_executions" (
    "id" TEXT NOT NULL,
    "coding_session_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "stdout" TEXT,
    "stderr" TEXT,
    "error" TEXT,
    "test_results" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coding_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coding_problems_title_key" ON "coding_problems"("title");

-- CreateIndex
CREATE UNIQUE INDEX "coding_problems_slug_key" ON "coding_problems"("slug");

-- CreateIndex
CREATE INDEX "coding_sessions_user_id_idx" ON "coding_sessions"("user_id");

-- CreateIndex
CREATE INDEX "coding_sessions_interview_session_id_idx" ON "coding_sessions"("interview_session_id");

-- CreateIndex
CREATE INDEX "coding_sessions_coding_problem_id_idx" ON "coding_sessions"("coding_problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "coding_evaluations_coding_session_id_key" ON "coding_evaluations"("coding_session_id");

-- CreateIndex
CREATE INDEX "coding_executions_coding_session_id_idx" ON "coding_executions"("coding_session_id");

-- AddForeignKey
ALTER TABLE "coding_sessions" ADD CONSTRAINT "coding_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_sessions" ADD CONSTRAINT "coding_sessions_interview_session_id_fkey" FOREIGN KEY ("interview_session_id") REFERENCES "interview_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_sessions" ADD CONSTRAINT "coding_sessions_coding_problem_id_fkey" FOREIGN KEY ("coding_problem_id") REFERENCES "coding_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_evaluations" ADD CONSTRAINT "coding_evaluations_coding_session_id_fkey" FOREIGN KEY ("coding_session_id") REFERENCES "coding_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_executions" ADD CONSTRAINT "coding_executions_coding_session_id_fkey" FOREIGN KEY ("coding_session_id") REFERENCES "coding_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
