import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("staff123", 10); // staff password
  const staff = await prisma.user.create({
    data: { username: "staff", password, role: "staff" },
  });
  console.log("✅ Staff user added:", staff);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
