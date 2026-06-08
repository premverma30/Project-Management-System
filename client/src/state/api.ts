import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export interface Project {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  ownerId?: string;
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
  tags?: string | string[];
  startDate?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
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
  productOwnerUserId?: string | User;
  projectManagerUserId?: string | User;
  members?: User[];
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
  tagTypes: ["Projects", "Tasks", "Users", "Teams", "AuthUser"],
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
    updateProjectStatus: build.mutation<Project, { projectId: string; status: string }>({
      query: ({ projectId, status }) => ({
        url: `projects/${projectId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Projects", id: projectId },
        { type: "Projects", id: "LIST" },
      ],
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
      invalidatesTags: (result, error, arg) => {
        // Always use arg.authorUserId as the reliable source (known at call time, always a plain string).
        // The result may have authorUserId as a populated User object (from .populate()), so we
        // defensively handle both cases as a fallback.
        const authorId =
          arg.authorUserId ??
          (result?.authorUserId
            ? typeof result.authorUserId === "string"
              ? result.authorUserId
              : (result.authorUserId as any)?._id ?? (result.authorUserId as any)?.id
            : undefined);

        const assigneeId =
          arg.assignedUserId ??
          (result?.assignedUserId
            ? typeof result.assignedUserId === "string"
              ? result.assignedUserId
              : (result.assignedUserId as any)?._id ?? (result.assignedUserId as any)?.id
            : undefined);

        const tags: any[] = [{ type: "Tasks", id: "LIST" }];
        if (authorId) tags.push({ type: "Tasks", id: `USER_${authorId}` });
        if (assigneeId && assigneeId !== authorId)
          tags.push({ type: "Tasks", id: `USER_${assigneeId}` });
        return tags;
      },
    }),
    updateTaskStatus: build.mutation<Task, { taskId: string; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => {
        const tags: any[] = [{ type: "Tasks", id: "LIST" }, { type: "Tasks", id: taskId }];
        if (result) {
           const authorId = typeof result.authorUserId === 'string' ? result.authorUserId : (result.authorUserId as any)?._id || (result.authorUserId as any)?.id;
           const assigneeId = typeof result.assignedUserId === 'string' ? result.assignedUserId : (result.assignedUserId as any)?._id || (result.assignedUserId as any)?.id;
           if (authorId) tags.push({ type: "Tasks", id: `USER_${authorId}` });
           if (assigneeId) tags.push({ type: "Tasks", id: `USER_${assigneeId}` });
        }
        return tags;
      },
    }),
    updateTask: build.mutation<Task, { taskId: string; taskData: Partial<Task> }>({
      query: ({ taskId, taskData }) => ({
        url: `tasks/${taskId}`,
        method: "PATCH",
        body: taskData,
      }),
      invalidatesTags: (result, error, { taskId, taskData }) => [
        { type: "Tasks", id: taskId },
        { type: "Tasks", id: "LIST" },
        ...(taskData.authorUserId ? [{ type: "Tasks" as const, id: `USER_${taskData.authorUserId}` }] : []),
      ],
    }),
    deleteTask: build.mutation<void, string>({
      query: (taskId) => ({
        url: `tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: (result) =>
        result
          ? [...result.map((t) => ({ type: "Teams" as const, id: t._id || t.teamId })), { type: "Teams", id: "LIST" }]
          : [{ type: "Teams", id: "LIST" }],
    }),
    createTeam: build.mutation<Team, { teamName: string }>({
      query: (body) => ({ url: "teams", method: "POST", body }),
      invalidatesTags: [{ type: "Teams", id: "LIST" }],
    }),
    addTeamMember: build.mutation<Team, { teamId: string; userId: string }>({
      query: ({ teamId, userId }) => ({
        url: `teams/${teamId}/members`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: "Teams", id: teamId },
        { type: "Teams", id: "LIST" },
      ],
    }),
    removeTeamMember: build.mutation<Team, { teamId: string; userId: string }>({
      query: ({ teamId, userId }) => ({
        url: `teams/${teamId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: "Teams", id: teamId },
        { type: "Teams", id: "LIST" },
      ],
    }),
    updateUser: build.mutation<User, { userId: string; userData: Partial<User> }>({
      query: ({ userId, userData }) => ({
        url: `users/${userId}`,
        method: "PATCH",
        body: userData,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "AuthUser", id: userId },
        { type: "Users", id: userId },
        { type: "Users", id: "LIST" },
      ],
    }),
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${encodeURIComponent(query)}`,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectStatusMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useCreateTeamMutation,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useGetTasksByUserQuery,
  useGetAuthUserQuery,
  useUpdateUserMutation,
} = api;
