CREATE TABLE IF NOT EXISTS "price" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"productId" varchar(255),
	"amount" varchar(255) NOT NULL,
	"currencyCode" "currencyCode" NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price" ADD CONSTRAINT "price_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
