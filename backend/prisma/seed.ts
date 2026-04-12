import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding challenge categories...");

  const categories = [
    {
      name: "Fitness",
      icon: "💪",
      color: "#e74c3c",
      xpReward: 15
    },
    {
      name: "Courage",
      icon: "🦁",
      color: "#f39c12",
      xpReward: 20
    },
    {
      name: "Creativity",
      icon: "🎨",
      color: "#9b59b6",
      xpReward: 15
    },
    {
      name: "Wisdom",
      icon: "📚",
      color: "#3498db",
      xpReward: 10
    },
    {
      name: "Social",
      icon: "🤝",
      color: "#2ecc71",
      xpReward: 10
    },
    {
      name: "Adventure",
      icon: "🗺️",
      color: "#1abc9c",
      xpReward: 25
    }
  ];

  for (const category of categories) {
    await prisma.challengeCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  console.log(`Seeded ${categories.length} challenge categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
