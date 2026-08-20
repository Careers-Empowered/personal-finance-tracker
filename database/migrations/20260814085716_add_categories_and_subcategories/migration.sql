-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SuggestionSource" AS ENUM ('RULE', 'SLM');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'OVERRIDDEN');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "category_id" UUID,
    "subcategory_id" UUID,
    "amount" DECIMAL(15,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imports" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "valid_rows" INTEGER NOT NULL DEFAULT 0,
    "invalid_rows" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorization_rules" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "field" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorization_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "source" "SuggestionSource" NOT NULL,
    "confidence" DECIMAL(5,4),
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "categories_user_id_idx" ON "categories"("user_id");

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "categories"("type");

-- CreateIndex
CREATE INDEX "subcategories_category_id_idx" ON "subcategories"("category_id");

-- CreateIndex
CREATE INDEX "subcategories_user_id_idx" ON "subcategories"("user_id");

-- CreateIndex
CREATE INDEX "transactions_account_id_idx" ON "transactions"("account_id");

-- CreateIndex
CREATE INDEX "transactions_category_id_idx" ON "transactions"("category_id");

-- CreateIndex
CREATE INDEX "transactions_subcategory_id_idx" ON "transactions"("subcategory_id");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "imports_user_id_idx" ON "imports"("user_id");

-- CreateIndex
CREATE INDEX "categorization_rules_user_id_idx" ON "categorization_rules"("user_id");

-- CreateIndex
CREATE INDEX "categorization_rules_category_id_idx" ON "categorization_rules"("category_id");

-- CreateIndex
CREATE INDEX "suggestions_transaction_id_idx" ON "suggestions"("transaction_id");

-- CreateIndex
CREATE INDEX "suggestions_category_id_idx" ON "suggestions"("category_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imports" ADD CONSTRAINT "imports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorization_rules" ADD CONSTRAINT "categorization_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorization_rules" ADD CONSTRAINT "categorization_rules_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
