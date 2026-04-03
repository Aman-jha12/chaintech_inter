import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: { name: "Demo User" },
    create: {
      email: "demo@example.com",
      name: "Demo User",
    },
  });

  await prisma.task.deleteMany({ where: { userId: user.id } });

  await prisma.task.createMany({
    data: [
      {
        title: "Set up project",
        description: "Install dependencies and configure environment variables",
        category: "Setup",
        userId: user.id,
      },
      {
        title: "Build task APIs",
        description: "Implement CRUD and complete endpoints",
        category: "Backend",
        completed: true,
        userId: user.id,
      },
      {
        title: "Polish UI",
        description: "Improve UX and document the project",
        category: "Frontend",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        userId: user.id,
      },
    ],
  });

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
