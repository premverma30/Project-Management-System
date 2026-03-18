import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Client } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// Fix __dirname for ESM 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Create PostgreSQL client
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});
// Create Prisma Client with PostgreSQL adapter
const adapter = new PrismaPg(client);
const prisma = new PrismaClient({ adapter });
async function deleteAllData(orderedFileNames) {
    const modelNames = orderedFileNames.map((fileName) => {
        const modelName = path.basename(fileName, path.extname(fileName));
        return modelName.charAt(0).toUpperCase() + modelName.slice(1);
    });
    for (const modelName of modelNames) {
        const model = prisma[modelName];
        if (!model)
            continue;
        try {
            await model.deleteMany({});
            console.log(`Cleared data from ${modelName}`);
        }
        catch (error) {
            console.error(`Error clearing data from ${modelName}:`, error);
        }
    }
}
async function main() {
    const dataDirectory = path.join(__dirname, "seedData");
    // DELETE ORDER (child → parent)
    const deleteOrder = [
        "projectTeam.json",
        "taskAssignment.json",
        "comment.json",
        "attachment.json",
        "task.json",
        "project.json",
        "team.json",
        "user.json",
    ];
    // INSERT ORDER (parent → child)
    const insertOrder = [
        "team.json", // first (no dependency)
        "user.json", // depends on team
        "project.json", // depends on team
        "task.json", // depends on project
        "attachment.json",
        "comment.json",
        "taskAssignment.json",
        "projectTeam.json",
    ];
    await deleteAllData(deleteOrder);
    for (const fileName of insertOrder) {
        const filePath = path.join(dataDirectory, fileName);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${fileName}`);
            continue;
        }
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const modelName = path.basename(fileName, path.extname(fileName));
        const model = prisma[modelName];
        if (!model) {
            console.warn(`Model not found: ${modelName}`);
            continue;
        }
        try {
            for (const data of jsonData) {
                // ✅ Fix for users: connect team instead of using teamId directly
                if (fileName === "user.json") {
                    const { teamId, ...rest } = data;
                    await model.create({
                        data: {
                            ...rest,
                            team: {
                                connect: { id: teamId }
                            }
                        }
                    });
                }
                else {
                    await model.create({ data });
                }
            }
            console.log(`Seeded ${modelName} with data from ${fileName}`);
        }
        catch (error) {
            console.error(`Error seeding data for ${modelName}:`, error);
        }
    }
}
// Run the seeding
main()
    .catch((e) => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
    console.log("Disconnected Prisma");
});
//# sourceMappingURL=seed.js.map