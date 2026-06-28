-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InterviewDomain" AS ENUM ('JAVA', 'PYTHON', 'DSA', 'SQL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'FRONTEND', 'BACKEND', 'FULL_STACK');

-- CreateEnum
CREATE TYPE "InterviewSessionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "category" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "estimated_time" INTEGER NOT NULL,
    "companies" TEXT[],
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "interview_id" TEXT,
    "code_answer" TEXT,
    "audio_answer_url" TEXT,
    "feedback" TEXT,
    "score" INTEGER,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "time_spent" INTEGER NOT NULL DEFAULT 0,
    "attempt_count" INTEGER NOT NULL DEFAULT 1,
    "reflection" TEXT,
    "completed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" "InterviewDomain" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "status" "InterviewSessionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "evaluation_status" "EvaluationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "model_name" TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    "prompt_version" TEXT,
    "question_count" INTEGER NOT NULL,
    "answered_count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_questions" (
    "id" TEXT NOT NULL,
    "interview_session_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_answers" (
    "id" TEXT NOT NULL,
    "interview_session_id" TEXT NOT NULL,
    "interview_question_id" TEXT NOT NULL,
    "user_answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_evaluations" (
    "id" TEXT NOT NULL,
    "interview_session_id" TEXT NOT NULL,
    "overall_score" INTEGER,
    "technical_accuracy" INTEGER,
    "communication" INTEGER,
    "clarity" INTEGER,
    "depth" INTEGER,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "recommendations" TEXT,
    "raw_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_evaluations" (
    "id" TEXT NOT NULL,
    "interview_evaluation_id" TEXT NOT NULL,
    "interview_question_id" TEXT NOT NULL,
    "score" INTEGER,
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_jobs" (
    "id" TEXT NOT NULL,
    "interview_session_id" TEXT NOT NULL,
    "status" "EvaluationStatus" NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_questions_solved" INTEGER NOT NULL,
    "total_interviews_completed" INTEGER NOT NULL,
    "average_interview_score" DOUBLE PRECISION NOT NULL,
    "study_time_seconds" INTEGER NOT NULL DEFAULT 0,
    "strongest_topic" TEXT,
    "weakest_topic" TEXT,
    "suggested_next_topic" TEXT,
    "recommended_focus_area" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "questions_slug_key" ON "questions"("slug");

-- CreateIndex
CREATE INDEX "submissions_user_id_idx" ON "submissions"("user_id");

-- CreateIndex
CREATE INDEX "submissions_question_id_idx" ON "submissions"("question_id");

-- CreateIndex
CREATE INDEX "submissions_user_id_completed_at_idx" ON "submissions"("user_id", "completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_user_id_question_id_key" ON "submissions"("user_id", "question_id");

-- CreateIndex
CREATE INDEX "interview_sessions_user_id_idx" ON "interview_sessions"("user_id");

-- CreateIndex
CREATE INDEX "interview_sessions_user_id_createdAt_idx" ON "interview_sessions"("user_id", "createdAt");

-- CreateIndex
CREATE INDEX "interview_questions_interview_session_id_idx" ON "interview_questions"("interview_session_id");

-- CreateIndex
CREATE INDEX "interview_answers_interview_session_id_idx" ON "interview_answers"("interview_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "interview_answers_interview_session_id_interview_question_i_key" ON "interview_answers"("interview_session_id", "interview_question_id");

-- CreateIndex
CREATE UNIQUE INDEX "interview_evaluations_interview_session_id_key" ON "interview_evaluations"("interview_session_id");

-- CreateIndex
CREATE INDEX "question_evaluations_interview_evaluation_id_idx" ON "question_evaluations"("interview_evaluation_id");

-- CreateIndex
CREATE INDEX "question_evaluations_interview_question_id_idx" ON "question_evaluations"("interview_question_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_evaluations_interview_evaluation_id_interview_ques_key" ON "question_evaluations"("interview_evaluation_id", "interview_question_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_jobs_interview_session_id_key" ON "evaluation_jobs"("interview_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_snapshots_user_id_key" ON "analytics_snapshots"("user_id");

-- CreateIndex
CREATE INDEX "analytics_snapshots_user_id_idx" ON "analytics_snapshots"("user_id");

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_interview_session_id_fkey" FOREIGN KEY ("interview_session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_answers" ADD CONSTRAINT "interview_answers_interview_session_id_fkey" FOREIGN KEY ("interview_session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_answers" ADD CONSTRAINT "interview_answers_interview_question_id_fkey" FOREIGN KEY ("interview_question_id") REFERENCES "interview_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_evaluations" ADD CONSTRAINT "interview_evaluations_interview_session_id_fkey" FOREIGN KEY ("interview_session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_evaluations" ADD CONSTRAINT "question_evaluations_interview_evaluation_id_fkey" FOREIGN KEY ("interview_evaluation_id") REFERENCES "interview_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_evaluations" ADD CONSTRAINT "question_evaluations_interview_question_id_fkey" FOREIGN KEY ("interview_question_id") REFERENCES "interview_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
