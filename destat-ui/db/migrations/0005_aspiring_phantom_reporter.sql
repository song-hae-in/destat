ALTER TABLE "answer" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "survey" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;