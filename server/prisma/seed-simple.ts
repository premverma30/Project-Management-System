import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(client);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("📊 Seeding Status Report:");
  console.log("==========================\n");

  try {
    const teamCount = await prisma.team.count();
    console.log(`✅ Teams in database: ${teamCount}`);

    const userCount = await prisma.user.count();
    console.log(`✅ Users in database: ${userCount}`);

    const projectCount = await prisma.project.count();
    console.log(`✅ Projects in database: ${projectCount}`);

    const taskCount = await prisma.task.count();
    console.log(`✅ Tasks in database: ${taskCount}`);

    const attachmentCount = await prisma.attachment.count();
    console.log(`✅ Attachments in database: ${attachmentCount}`);

    const commentCount = await prisma.comment.count();
    console.log(`✅ Comments in database: ${commentCount}`);

    const taskAssignmentCount = await prisma.taskAssignment.count();
    console.log(`✅ Task Assignments in database: ${taskAssignmentCount}`);

    const projectTeamCount = await prisma.projectTeam.count();
    console.log(`✅ Project Teams in database: ${projectTeamCount}`);

    console.log("\n✨ Core data is ready for use!");
    if (teamCount >= 5 && userCount >= 20 && projectCount >= 10) {
      console.log("   Your database has enough data to test the API.");
    }
  } catch (error) {
    console.error("❌ Error checking database:", error);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await client.end();
  });
