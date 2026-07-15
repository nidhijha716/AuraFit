-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "goals" TEXT NOT NULL DEFAULT '["stay_active"]',
    "experience_level" TEXT NOT NULL DEFAULT 'beginner',
    "workout_days" TEXT NOT NULL DEFAULT '[1,3,5]',
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "height_cm" REAL,
    "weight_kg" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "day_routines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "day_routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "routine_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routine_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "target_sets" INTEGER NOT NULL,
    "target_reps" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    CONSTRAINT "routine_exercises_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "day_routines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "workout_id" TEXT NOT NULL,
    "workout_name" TEXT NOT NULL,
    "started_at" DATETIME NOT NULL,
    "completed_at" DATETIME NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "exercises_completed" TEXT NOT NULL,
    CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_checklists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "routine_name" TEXT NOT NULL,
    "all_complete" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" DATETIME,
    CONSTRAINT "daily_checklists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checklist_exercise_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklist_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" DATETIME,
    CONSTRAINT "checklist_exercise_entries_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "daily_checklists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "set_log_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklist_exercise_id" TEXT NOT NULL,
    "set_number" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "set_log_entries_checklist_exercise_id_fkey" FOREIGN KEY ("checklist_exercise_id") REFERENCES "checklist_exercise_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
