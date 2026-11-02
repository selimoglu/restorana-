import { PrismaClient } from "@prisma/client";
import { seedDemo } from "../src/lib/demo-seed";

const db = new PrismaClient();

seedDemo(db)
  .then(() => console.log("Demo verisi hazır → /r/lezzet-duragi | Panel: demo@sofra.app / demo1234"))
  .finally(() => db.$disconnect());
