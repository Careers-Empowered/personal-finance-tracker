const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const userId = "9a1b181c-d789-4d6b-873f-c12140a32456";

  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { userId },
        { userId: null }
      ]
    },
    include: {
      subcategories: true
    }
  });

  console.dir(categories, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
