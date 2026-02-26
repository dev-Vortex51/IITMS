const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const deleteUserByEmail = async (email) => {
  try {
    // Find the user first to confirm they exist
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log(`User with email ${email} not found`);
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log(`Found user: ${user.email} (${user.role})`);
    console.log(`User ID: ${user.id}`);

    // Delete in transaction to handle cascading relationships
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete notifications for this user
      const deletedNotifications = await tx.notification.deleteMany({
        where: {
          OR: [{ recipientId: user.id }, { createdById: user.id }],
        },
      });
      console.log(`- Deleted ${deletedNotifications.count} notifications`);

      // 2. Delete invitations created by this user
      const deletedInvitations = await tx.invitation.deleteMany({
        where: { invitedById: user.id },
      });
      console.log(`- Deleted ${deletedInvitations.count} invitations`);

      // 3. Delete the user (cascading deletes will remove student, supervisor, etc.)
      const deletedUser = await tx.user.delete({
        where: { email: email.toLowerCase() },
      });
      return deletedUser;
    });

    console.log(`\n✓ User deleted successfully: ${result.email}`);
    console.log(`- Related records were also cleaned up`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error deleting user:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Get email from command line argument or use default
const email = process.argv[2] || "student@mail.com";
deleteUserByEmail(email);
