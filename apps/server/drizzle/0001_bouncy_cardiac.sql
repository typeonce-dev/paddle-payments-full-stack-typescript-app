ALTER TABLE "product" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "description" varchar(255);--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "imageUrl" varchar(255);