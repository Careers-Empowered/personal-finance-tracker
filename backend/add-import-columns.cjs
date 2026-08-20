const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "transactions"
    ADD COLUMN IF NOT EXISTS "imported_with_override" BOOLEAN NOT NULL DEFAULT false;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "transactions"
    ADD COLUMN IF NOT EXISTS "override_note" TEXT;
  `);

  console.log("Import tracking columns added successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
