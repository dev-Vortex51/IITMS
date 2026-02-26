const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const resetAdminPassword = async () => {
  const email = "admin@siwes.edu";
  const newPassword = "Admin@123";

  const hash = await bcrypt.hash(newPassword, 12);
  const user = await prisma.user.update({
    where: { email },
    data: {
      password: hash,
      passwordResetRequired: false,
      isActive: true,
    },
  });

  console.log(`Reset admin password for ${user.email}`);
  await prisma.$disconnect();
};

resetAdminPassword().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
