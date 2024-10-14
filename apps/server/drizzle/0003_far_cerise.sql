DO $$ BEGIN
 CREATE TYPE "public"."currencyCode" AS ENUM('USD', 'EUR', 'GBP', 'JPY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "product_slug_unique";--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "slug";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "price";