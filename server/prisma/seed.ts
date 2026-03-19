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

// Create PostgreSQL client with increased timeout
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  statement_timeout: 30000, // 30 seconds statement timeout
  idle_in_transaction_session_timeout: 30000,
});

// Create Prisma Client with PostgreSQL adapter
const adapter = new PrismaPg(client);
const prisma = new PrismaClient({ adapter });

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  for (const modelName of modelNames) {
    const model: any = prisma[modelName as keyof typeof prisma];
    if (!model) continue;
    try {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
      // Add small delay to allow connection recovery
      await delay(100);
    } catch (error) {
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

  await deleteAllData(deleteOrder);

  // Step 1: Create teams and store mapping
  console.log("\n🔄 Creating teams...");
  const teamFile = path.join(dataDirectory, "team.json");
  const teamJsonData = JSON.parse(fs.readFileSync(teamFile, "utf-8"));
  const teamIdMap = new Map<number, number>(); // maps original index (1-based) to created ID
  
  for (let i = 0; i < teamJsonData.length; i++) {
    const teamData = teamJsonData[i];
    // Create team without user references initially
    const { productOwnerUserId, projectManagerUserId, ...teamDataWithoutUserIds } = teamData;
    const createdTeam = await prisma.team.create({
      data: teamDataWithoutUserIds
    });
    teamIdMap.set(i + 1, createdTeam.id); // Map original index to created ID
    console.log(`✅ Created team: ${createdTeam.teamName} (ID: ${createdTeam.id})`);
  }

  // Step 2: Create users and store mapping by index
  console.log("\n🔄 Creating users...");
  const userFile = path.join(dataDirectory, "user.json");
  const userJsonData = JSON.parse(fs.readFileSync(userFile, "utf-8"));
  const userIdMap = new Map<number, number>(); // maps JSON index (1-based) to created user ID
  const createdUserIds: number[] = []; // Keep order of created user IDs
  
  for (let i = 0; i < userJsonData.length; i++) {
    const userData = userJsonData[i];
    const { teamId, ...rest } = userData;
    
    // Map the team ID
    const mappedTeamId = teamId ? teamIdMap.get(teamId) : null;
    
    try {
      const createdUser = await prisma.user.create({
        data: {
          ...rest,
          ...(mappedTeamId && { team: { connect: { id: mappedTeamId } } })
        }
      });
      userIdMap.set(i + 1, createdUser.userId); // Map JSON index to created user ID
      createdUserIds.push(createdUser.userId);
      console.log(`✅ Created user: ${createdUser.username} (ID: ${createdUser.userId})`);
    } catch (error) {
      console.error(`❌ Error creating user ${rest.username}:`, error);
    }
  }

  // Step 3: Create projects
  console.log("\n🔄 Creating projects...");
  const projectFile = path.join(dataDirectory, "project.json");
  if (fs.existsSync(projectFile)) {
    const projectJsonData = JSON.parse(fs.readFileSync(projectFile, "utf-8"));
    const projectIdMap = new Map<number, number>();
    
    for (const projectData of projectJsonData) {
      const { id, ...projectDataWithoutId } = projectData;
      try {
        const createdProject = await prisma.project.create({
          data: projectDataWithoutId
        });
        projectIdMap.set(id, createdProject.id);
        console.log(`✅ Created project: ${createdProject.name} (ID: ${createdProject.id})`);
      } catch (error) {
        console.error(`❌ Error creating project:`, error);
      }
    }
  }

  // Step 4: Create tasks with mapped user IDs
  console.log("\n🔄 Creating tasks...");
  const taskFile = path.join(dataDirectory, "task.json");
  if (fs.existsSync(taskFile)) {
    const taskJsonData = JSON.parse(fs.readFileSync(taskFile, "utf-8"));
    const taskIdMap = new Map<number, number>();
    
    console.log(`📋 User ID mappings: ${JSON.stringify(Array.from(userIdMap.entries()))}`);
    
    for (const taskData of taskJsonData) {
      const { id, authorUserId, assignedUserId, ...rest } = taskData;
      
      const mappedAuthorId = userIdMap.get(authorUserId);
      const mappedAssigneeId = assignedUserId ? userIdMap.get(assignedUserId) : null;
      
      if (!mappedAuthorId) {
        console.error(`❌ Task ${id} skipped: Author user ID ${authorUserId} not found in user map (available: ${Array.from(userIdMap.keys()).join(', ')})`);
        continue;
      }
      
      try {
        const createdTask = await prisma.task.create({
          data: {
            ...rest,
            authorUserId: mappedAuthorId,
            assignedUserId: mappedAssigneeId || undefined
          }
        });
        taskIdMap.set(id, createdTask.id);
        console.log(`✅ Created task: ${createdTask.title} (ID: ${createdTask.id})`);
      } catch (error) {
        console.error(`❌ Error creating task ${id} (${rest.title}):`, error);
      }
    }
  }

  console.log("\n✨ Core data seeding completed!");
  console.log("   Teams, Users, Projects, and Tasks have been created.");
  console.log("   Note: Attachments, Comments, Task Assignments, and Project Teams");
  console.log("         can be created separately using raw SQL queries if needed.");
}

// Run the seeding
main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    // Also close the underlying PostgreSQL connection
    await client.end();
    console.log("Disconnected Prisma and PostgreSQL connection");
  });