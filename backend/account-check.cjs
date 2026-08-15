const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.account.findMany({
    where: {
      userId: "9a1b181c-d789-4d6b-873f-c12140a32456"
    }
  });

  console.dir(accounts, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
