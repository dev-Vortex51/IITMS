const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const run = async () => {
  const userCount = await prisma.user.count();
  const admin = await prisma.user.findUnique({
    where: { email: "admin@siwes.edu" },
    select: { id: true, email: true, role: true, isActive: true },
  });

  console.log(JSON.stringify({ userCount, admin }, null, 2));
  await prisma.$disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
