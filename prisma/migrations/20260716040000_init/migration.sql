-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "goals" TEXT NOT NULL DEFAULT '["stay_active"]',
    "experience_level" TEXT NOT NULL DEFAULT 'beginner',
    "workout_days" TEXT NOT NULL DEFAULT '[1,3,5]',
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "height_cm" DOUBLE PRECISION,
    "weight_kg" DOUBLE PRECISION,
    "sex" TEXT,
    "age" INTEGER,
    "activity_level" TEXT,
    "theme_preset" TEXT NOT NULL DEFAULT 'classic',
    "reminder_enabled" BOOLEAN NOT NULL DEFAULT false,
    "reminder_time_local" TEXT NOT NULL DEFAULT '18:00',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "day_routines" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "day_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_exercises" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "target_sets" INTEGER NOT NULL,
    "target_reps" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "routine_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workout_id" TEXT NOT NULL,
    "workout_name" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "exercises_completed" TEXT NOT NULL,
    "estimated_calories_burned" INTEGER,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_checklists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "routine_name" TEXT NOT NULL,
    "all_complete" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "daily_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_exercise_entries" (
    "id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "checklist_exercise_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "set_log_entries" (
    "id" TEXT NOT NULL,
    "checklist_exercise_id" TEXT NOT NULL,
    "set_number" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "weight_kg" DOUBLE PRECISION,

    CONSTRAINT "set_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "weight_kg" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "achieved_at" TIMESTAMP(3) NOT NULL,
    "source_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "day_routines_user_id_idx" ON "day_routines"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "day_routines_user_id_day_of_week_key" ON "day_routines"("user_id", "day_of_week");

-- CreateIndex
CREATE INDEX "routine_exercises_routine_id_idx" ON "routine_exercises"("routine_id");

-- CreateIndex
CREATE INDEX "workout_sessions_user_id_idx" ON "workout_sessions"("user_id");

-- CreateIndex
CREATE INDEX "daily_checklists_user_id_idx" ON "daily_checklists"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_checklists_user_id_date_key" ON "daily_checklists"("user_id", "date");

-- CreateIndex
CREATE INDEX "checklist_exercise_entries_checklist_id_idx" ON "checklist_exercise_entries"("checklist_id");

-- CreateIndex
CREATE INDEX "set_log_entries_checklist_exercise_id_idx" ON "set_log_entries"("checklist_exercise_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "personal_records_user_id_idx" ON "personal_records"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "personal_records_user_id_exercise_id_key" ON "personal_records"("user_id", "exercise_id");

-- AddForeignKey
ALTER TABLE "day_routines" ADD CONSTRAINT "day_routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "day_routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_checklists" ADD CONSTRAINT "daily_checklists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_exercise_entries" ADD CONSTRAINT "checklist_exercise_entries_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "daily_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "set_log_entries" ADD CONSTRAINT "set_log_entries_checklist_exercise_id_fkey" FOREIGN KEY ("checklist_exercise_id") REFERENCES "checklist_exercise_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
