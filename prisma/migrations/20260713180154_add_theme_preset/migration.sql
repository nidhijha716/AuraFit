-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
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
    "theme_preset" TEXT NOT NULL DEFAULT 'classic',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("created_at", "email", "experience_level", "goals", "height_cm", "id", "name", "onboarding_complete", "password_hash", "updated_at", "weight_kg", "workout_days") SELECT "created_at", "email", "experience_level", "goals", "height_cm", "id", "name", "onboarding_complete", "password_hash", "updated_at", "weight_kg", "workout_days" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
