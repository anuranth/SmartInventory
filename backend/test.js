// addCategory.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const newCategory = await prisma.category.create({
    data: {
      category_name: "Groceries", // 👈 change name as you like
    },
  });

  console.log("✅ Category added:", newCategory);
}

main()
  .catch((err) => console.error(err))
  .finally(async () => await prisma.$disconnect());
