-- CreateTable
CREATE TABLE "ares_v6_generations" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "device_brand" TEXT NOT NULL,
    "device_model" TEXT NOT NULL,
    "device_slug" TEXT,
    "preset_id" TEXT NOT NULL,
    "playstyle" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "fingers" SMALLINT NOT NULL,
    "primary_weapon_category" TEXT,
    "ppi_source" TEXT NOT NULL,
    "detected_ppi" INTEGER,
    "confidence_score" SMALLINT NOT NULL,
    "confidence_grade" TEXT NOT NULL,
    "sensitivity" JSONB NOT NULL,
    "gyroscope" JSONB,
    "dpi" JSONB NOT NULL,
    "fire_button" JSONB NOT NULL,
    "hud" JSONB NOT NULL,
    "tuning_steps" JSONB NOT NULL,
    "warnings" JSONB NOT NULL,
    "rate_limit_scopes" JSONB,
    "rate_limit_degraded" BOOLEAN NOT NULL DEFAULT false,
    "proxy_trusted" BOOLEAN,
    "proxy_ip_source" TEXT,
    "db_duration_ms" INTEGER,
    "engine_duration_ms" INTEGER,
    "total_duration_ms" INTEGER,
    "lab_mode" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'INTERNAL_LAB',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ares_v6_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ares_v6_feedback" (
    "id" TEXT NOT NULL,
    "generation_id" TEXT NOT NULL,
    "request_id" TEXT,
    "device_id" TEXT NOT NULL,
    "preset_id" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "outcome" TEXT NOT NULL,
    "problem_resolved" BOOLEAN,
    "symptoms" JSONB,
    "adjustments_applied" JSONB,
    "comment" VARCHAR(280),
    "quality_flag" TEXT NOT NULL DEFAULT 'TRUSTED',
    "quality_reasons" JSONB,
    "source" TEXT NOT NULL DEFAULT 'INTERNAL_LAB',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ares_v6_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ares_v6_lab_runs" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "commit_sha" TEXT,
    "environment" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "summary" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ares_v6_lab_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ares_v6_generations_request_id_key" ON "ares_v6_generations"("request_id");

-- CreateIndex
CREATE INDEX "ares_v6_generations_device_id_idx" ON "ares_v6_generations"("device_id");

-- CreateIndex
CREATE INDEX "ares_v6_generations_preset_id_idx" ON "ares_v6_generations"("preset_id");

-- CreateIndex
CREATE INDEX "ares_v6_generations_mode_idx" ON "ares_v6_generations"("mode");

-- CreateIndex
CREATE INDEX "ares_v6_generations_confidence_grade_idx" ON "ares_v6_generations"("confidence_grade");

-- CreateIndex
CREATE INDEX "ares_v6_generations_created_at_idx" ON "ares_v6_generations"("created_at");

-- CreateIndex
CREATE INDEX "ares_v6_feedback_device_id_idx" ON "ares_v6_feedback"("device_id");

-- CreateIndex
CREATE INDEX "ares_v6_feedback_preset_id_idx" ON "ares_v6_feedback"("preset_id");

-- CreateIndex
CREATE INDEX "ares_v6_feedback_rating_idx" ON "ares_v6_feedback"("rating");

-- CreateIndex
CREATE INDEX "ares_v6_feedback_quality_flag_idx" ON "ares_v6_feedback"("quality_flag");

-- CreateIndex
CREATE INDEX "ares_v6_feedback_created_at_idx" ON "ares_v6_feedback"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ares_v6_feedback_generation_id_key" ON "ares_v6_feedback"("generation_id");

-- CreateIndex
CREATE INDEX "ares_v6_lab_runs_environment_idx" ON "ares_v6_lab_runs"("environment");

-- CreateIndex
CREATE INDEX "ares_v6_lab_runs_status_idx" ON "ares_v6_lab_runs"("status");

-- CreateIndex
CREATE INDEX "ares_v6_lab_runs_created_at_idx" ON "ares_v6_lab_runs"("created_at");

