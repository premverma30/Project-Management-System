import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Client } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(client);
const prisma = new PrismaClient({ adapter });

async function main() {
  const dataDirectory = path.join(__dirname, "prisma/seedData");
  
  const insertOrder = [
    "team.json",
    "user.json",
    "project.json",
    "task.json",
    "attachment.json",
    "comment.json",
    "taskAssignment.json",
    "projectTeam.json",
  ];

  console.log("Starting seed...\n");

  for (const fileName of insertOrder) {
    const filePath = path.join(dataDirectory, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${fileName}`);
      continue;
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    if (!model) {
      console.warn(`⚠️ Model not found: ${modelName}`);
      continue;
    }

    try {
      for (const data of jsonData) {
        if (fileName === "user.json") {
          const { teamId, ...rest } = data;
          await model.create({
            data: {
              ...rest,
              team: { connect: { id: teamId } }
            }
          });
        } else {
          await model.create({ data });
        }
      }
      console.log(`✅ Seeded ${modelName} from ${fileName}`);
    } catch (error) {
      console.error(`❌ Error seeding ${modelName}:`, error);
    }
  }

  console.log("\n✨ Seed complete!");
}

main()
  .catch((e) => { console.error("Fatal error:", e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
