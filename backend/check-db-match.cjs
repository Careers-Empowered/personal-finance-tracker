const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.transaction.findMany({
    where: {
      accountId: "8a1bc1c2-6789-4b11-a8cf-8bc13426e2ef",
      date: new Date("2026-08-15"),
      Title: "Database Connection Test",
      amount: 10,
      type: "EXPENSE"
    },
    select: {
      id: true,
      accountId: true,
      date: true,
      Title: true,
      amount: true,
      type: true
    }
  });

  console.dir(rows, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
