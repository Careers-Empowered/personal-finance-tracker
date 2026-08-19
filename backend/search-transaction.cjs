const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.transaction.findMany({
    where: {
      Title: {
        contains: "Database Connection Test",
        mode: "insensitive"
      }
    },
    select: {
      id: true,
      accountId: true,
      categoryId: true,
      subcategory_id: true,
      amount: true,
      type: true,
      date: true,
      Title: true
    }
  });

  console.dir(rows, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
