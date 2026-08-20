const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function test() {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;

    console.log("DATABASE CONNECTED");
    console.log(result);
  } catch (error) {
    console.error("DATABASE ERROR");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();