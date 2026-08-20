const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 5
  });

  console.dir(transactions, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
