const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
    },
  });

  const sessions = await prisma.session.findMany({
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      token: true,
    },
  });

  console.log("USERS:");
  console.dir(users, { depth: null });

  console.log("\nSESSIONS:");
  console.dir(sessions, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
