import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export interface Project {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
}

export interface User {
  _id?: string;
  userId?: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  googleId?: string;
  teamId?: string;
}

export interface Attachment {
  _id?: string;
  id?: string;
  fileURL: string;
  fileName: string;
  taskId: string;
  uploadedById: string;
}

export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: string;
  authorUserId?: string;
  assignedUserId?: string;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface Team {
  _id?: string;
  teamId?: string;
  teamName: string;
  productOwnerUserId?: string;
  projectManagerUserId?: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: async (headers) => {
      const session = await getSession();
      const token = (session as any)?.backendToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams"],
  endpoints: (build) => ({
    getAuthUser: build.query({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const session = await getSession();
          if (!session) throw new Error("No session found");
          const mongoId = (session as any).mongoId;

          const userDetailsResponse = await fetchWithBQ(`users/${mongoId}`);
          const userDetails = userDetailsResponse.data as User;

          return { data: userDetails };
        } catch (error: any) {
          return { error: error.message || "Could not fetch user data" };
        }
      },
      providesTags: ["AuthUser"],
    }),
    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: (result) =>
        result
          ? [
              ...result.map((project) => ({ type: "Projects" as const, id: project._id || project.id })),
              { type: "Projects", id: "LIST" },
            ]
          : [{ type: "Projects", id: "LIST" }],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),
    getTasks: build.query<Task[], { projectId: string }>({
      query: ({ projectId }) => `tasks?projectId=${projectId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map((task) => ({ type: "Tasks" as const, id: task._id || task.id })),
              { type: "Tasks", id: "LIST" },
            ]
          : [{ type: "Tasks", id: "LIST" }],
    }),
    getTasksByUser: build.query<Task[], string>({
      query: (userId) => `tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? [
              ...result.map((task) => ({ type: "Tasks" as const, id: task._id || task.id })),
              { type: "Tasks", id: `USER_${userId}` },
            ]
          : [{ type: "Tasks", id: `USER_${userId}` }],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Tasks", id: "LIST" },
        { type: "Tasks", id: `USER_${arg.authorUserId}` },
      ],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: string; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: ["Teams"],
    }),
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${encodeURIComponent(query)}`,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useGetAuthUserQuery,
} = api;
