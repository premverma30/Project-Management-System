import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Models
import User from "./models/User.js";
import Team from "./models/Team.js";
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import ProjectTeam from "./models/ProjectTeam.js";
import TaskAssignment from "./models/TaskAssignment.js";
import Attachment from "./models/Attachment.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected.");

    // Clear existing data
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      ProjectTeam.deleteMany({}),
      TaskAssignment.deleteMany({}),
      Attachment.deleteMany({}),
    ]);

    // Load JSON files
    const readJSON = (file: string) => JSON.parse(fs.readFileSync(path.join(__dirname, "seedData", file), "utf-8"));

    const teamsData = readJSON("team.json");
    const usersData = readJSON("user.json");
    const projectsData = readJSON("project.json");
    const tasksData = readJSON("task.json");
    const projectTeamsData = readJSON("projectTeam.json");
    const taskAssignmentsData = readJSON("taskAssignment.json");
    const attachmentsData = readJSON("attachment.json");
    const commentsData = readJSON("comment.json");

    // 1. Seed Teams
    console.log("Seeding Teams...");
    const teamIdMap: Record<number, any> = {};
    for (let i = 0; i < teamsData.length; i++) {
        const team = await Team.create({
            teamName: teamsData[i].teamName,
            // productOwnerUserId and projectManagerUserId will be updated later or ignored if not required by schema
        });
        teamIdMap[i + 1] = team._id; // Mapping index (1-based) to ObjectId
    }

    // 2. Seed Users
    console.log("Seeding Users...");
    const userIdMap: Record<number, any> = {};
    for (let i = 0; i < usersData.length; i++) {
        const user = await User.create({
            username: usersData[i].username,
            googleId: usersData[i].cognitoId, // Mapping cognitoId to googleId
            email: `${usersData[i].username.toLowerCase()}@example.com`,
            profilePictureUrl: usersData[i].profilePictureUrl,
            teamId: teamIdMap[usersData[i].teamId]
        });
        userIdMap[i + 1] = user._id;
    }

    // Update Team PO/PM
    for (let i = 0; i < teamsData.length; i++) {
        await Team.findByIdAndUpdate(teamIdMap[i + 1], {
            productOwnerUserId: userIdMap[teamsData[i].productOwnerUserId],
            projectManagerUserId: userIdMap[teamsData[i].projectManagerUserId]
        });
    }

    // 3. Seed Projects
    console.log("Seeding Projects...");
    const projectIdMap: Record<number, any> = {};
    for (const p of projectsData) {
        const project = await Project.create({
            name: p.name,
            description: p.description,
            startDate: p.startDate,
            endDate: p.endDate
        });
        projectIdMap[p.id] = project._id;
    }

    // 4. Seed Tasks
    console.log("Seeding Tasks...");
    const taskIdMap: Record<number, any> = {};
    for (const t of tasksData) {
        // Map comments if they exist in task.json or separate file
        // In our case, comments are separate.
        const task = await Task.create({
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            tags: t.tags,
            startDate: t.startDate,
            dueDate: t.dueDate,
            points: t.points,
            projectId: projectIdMap[t.projectId],
            authorUserId: userIdMap[t.authorUserId],
            assignedUserId: userIdMap[t.assignedUserId],
            comments: [] // Will add later
        });
        taskIdMap[t.id] = task._id;
    }

    // 5. Seed Comments (embedded in Tasks)
    console.log("Seeding Comments...");
    for (const c of commentsData) {
        await Task.findByIdAndUpdate(taskIdMap[c.taskId], {
            $push: {
                comments: {
                    text: c.text,
                    userId: userIdMap[c.userId]
                }
            }
        });
    }

    // 6. Seed ProjectTeams
    console.log("Seeding ProjectTeams...");
    for (const pt of projectTeamsData) {
        await ProjectTeam.create({
            teamId: teamIdMap[pt.teamId],
            projectId: projectIdMap[pt.projectId]
        });
    }

    // 7. Seed TaskAssignments
    console.log("Seeding TaskAssignments...");
    for (const ta of taskAssignmentsData) {
        await TaskAssignment.create({
            userId: userIdMap[ta.userId],
            taskId: taskIdMap[ta.taskId]
        });
    }

    // 8. Seed Attachments
    console.log("Seeding Attachments...");
    for (const a of attachmentsData) {
        await Attachment.create({
            fileURL: a.fileURL,
            fileName: a.fileName,
            taskId: taskIdMap[a.taskId],
            uploadedById: userIdMap[a.uploadedById]
        });
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
