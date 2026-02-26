const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const code = (process.argv[2] || "IFT").trim();

  const rows = await prisma.department.findMany({
    where: {
      code: { equals: code, mode: "insensitive" },
    },
    select: {
      id: true,
      name: true,
      code: true,
      facultyId: true,
      isActive: true,
      updatedAt: true,
    },
  });

  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
