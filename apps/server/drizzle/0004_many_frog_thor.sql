ALTER TYPE "currencyCode" ADD VALUE 'AUD';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'CAD';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'CHF';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'HKD';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'SGD';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'SEK';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'ARS';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'BRL';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'CNY';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'COP';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'CZK';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'DKK';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'HUF';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'ILS';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'INR';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'KRW';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'MXN';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'NOK';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'NZD';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'PLN';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'RUB';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'THB';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'TRY';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'TWD';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'UAH';--> statement-breakpoint
ALTER TYPE "currencyCode" ADD VALUE 'ZAR';--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_slug_unique" UNIQUE("slug");