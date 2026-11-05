/**
 * ============================================================================
 *  API — THE ONLY FILE YOUR PAGES SHOULD USE
 * ============================================================================
 *  Each function looks at the USE_MOCK variable in the .env.local file:
 *    - USE_MOCK=true  → returns the fake data (mock-api.ts)
 *    - USE_MOCK=false → calls the real backend (URL_API)
 *  In both cases, the response has EXACTLY the same shape:
 *    { success: true,  message: "...", data: {...} }
 *    { success: false, message: "...", error: "ERROR_CODE" }
 *
 *  ⚠️ These functions are meant for the SERVER side only:
 *     - in a Server Component (a page/component WITHOUT "use client")
 *     - or in a Server Action ("use server")
 *     The USE_MOCK and URL_API variables don't exist in the browser.
 * ============================================================================
 */

import { cookies } from "next/headers";
import * as mock from "./mock-api";
import type {
  ApiResponse,
  AuthData,
  ProfileUser,
  User,
  UserSummary,
  ProjectWithRole,
  ProjectWithRelations,
  ProjectDetail,
  TaskDetail,
  CommentDetail,
  AssignedTask,
  DashboardProject,
  DashboardStats,
  RegisterBody,
  LoginBody,
  UpdateProfileBody,
  UpdatePasswordBody,
  CreateProjectBody,
  UpdateProjectBody,
  AddContributorBody,
  CreateTaskBody,
  UpdateTaskBody,
  CommentBody,
} from "./types";

const USE_MOCK = process.env.USE_MOCK === "true";
const API_URL = process.env.URL_API ?? "http://localhost:8000";

/** Name of the cookie in which the JWT token will be stored after login */
export const TOKEN_COOKIE_NAME = "token";

/**
 * Sends a request to the REAL backend (used only if USE_MOCK=false).
 * Automatically adds the JWT token (read from the "token" cookie) if there is one.
 */
async function request<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<ApiResponse<T>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store", // always fresh data
    });
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      message: "Impossible de joindre le backend. Est-il bien démarré ?",
      error: "NETWORK_ERROR",
    };
  }
}

// ============================================================================
//  AUTHENTICATION
// ============================================================================

/** Sign up — POST /auth/register */
export async function register(body: RegisterBody): Promise<ApiResponse<AuthData>> {
  if (USE_MOCK) return mock.register(body);
  return request("/auth/register", "POST", body);
}

/** Log in — POST /auth/login */
export async function login(body: LoginBody): Promise<ApiResponse<AuthData>> {
  if (USE_MOCK) return mock.login(body);
  return request("/auth/login", "POST", body);
}

/** Logged-in user's profile — GET /auth/profile */
export async function getProfile(): Promise<ApiResponse<{ user: ProfileUser }>> {
  if (USE_MOCK) return mock.getProfile();
  return request("/auth/profile");
}

/** Update your name / email — PUT /auth/profile */
export async function updateProfile(
  body: UpdateProfileBody
): Promise<ApiResponse<{ user: User }>> {
  if (USE_MOCK) return mock.updateProfile(body);
  return request("/auth/profile", "PUT", body);
}

/** Update your password — PUT /auth/password */
export async function updatePassword(body: UpdatePasswordBody): Promise<ApiResponse> {
  if (USE_MOCK) return mock.updatePassword(body);
  return request("/auth/password", "PUT", body);
}

// ============================================================================
//  PROJECTS
// ============================================================================

/** My projects (owner or member) — GET /projects */
export async function getProjects(): Promise<ApiResponse<{ projects: ProjectWithRole[] }>> {
  if (USE_MOCK) return mock.getProjects();
  return request("/projects");
}

/** A project with its members and tasks (without assignees) — GET /projects/:id */
export async function getProject(
  projectId: string
): Promise<ApiResponse<{ project: ProjectDetail }>> {
  if (USE_MOCK) return mock.getProject(projectId);
  return request(`/projects/${projectId}`);
}

/** Create a project — POST /projects */
export async function createProject(
  body: CreateProjectBody
): Promise<ApiResponse<{ project: ProjectWithRelations }>> {
  if (USE_MOCK) return mock.createProject(body);
  return request("/projects", "POST", body);
}

/** Update a project — PUT /projects/:id */
export async function updateProject(
  projectId: string,
  body: UpdateProjectBody
): Promise<ApiResponse<{ project: ProjectWithRelations }>> {
  if (USE_MOCK) return mock.updateProject(projectId, body);
  return request(`/projects/${projectId}`, "PUT", body);
}

/** Delete a project — DELETE /projects/:id */
export async function deleteProject(projectId: string): Promise<ApiResponse> {
  if (USE_MOCK) return mock.deleteProject(projectId);
  return request(`/projects/${projectId}`, "DELETE");
}

/** Add a contributor (by email) — POST /projects/:id/contributors */
export async function addContributor(
  projectId: string,
  body: AddContributorBody
): Promise<ApiResponse> {
  if (USE_MOCK) return mock.addContributor(projectId, body);
  return request(`/projects/${projectId}/contributors`, "POST", body);
}

/** Remove a contributor — DELETE /projects/:id/contributors/:userId */
export async function removeContributor(
  projectId: string,
  userId: string
): Promise<ApiResponse> {
  if (USE_MOCK) return mock.removeContributor(projectId, userId);
  return request(`/projects/${projectId}/contributors/${userId}`, "DELETE");
}

// ============================================================================
//  USERS
// ============================================================================

/** Search users by name or email — GET /users/search?query=... */
export async function searchUsers(
  query: string
): Promise<ApiResponse<{ users: UserSummary[] }>> {
  if (USE_MOCK) return mock.searchUsers(query);
  return request(`/users/search?query=${encodeURIComponent(query)}`);
}

// ============================================================================
//  TASKS
// ============================================================================

/** A project's tasks, with assignees and comments — GET /projects/:id/tasks */
export async function getProjectTasks(
  projectId: string
): Promise<ApiResponse<{ tasks: TaskDetail[] }>> {
  if (USE_MOCK) return mock.getProjectTasks(projectId);
  return request(`/projects/${projectId}/tasks`);
}

/** A task — GET /projects/:id/tasks/:taskId */
export async function getTask(
  projectId: string,
  taskId: string
): Promise<ApiResponse<{ task: TaskDetail }>> {
  if (USE_MOCK) return mock.getTask(projectId, taskId);
  return request(`/projects/${projectId}/tasks/${taskId}`);
}

/** Create a task — POST /projects/:id/tasks */
export async function createTask(
  projectId: string,
  body: CreateTaskBody
): Promise<ApiResponse<{ task: TaskDetail }>> {
  if (USE_MOCK) return mock.createTask(projectId, body);
  return request(`/projects/${projectId}/tasks`, "POST", body);
}

/** Update a task (title, status, assignees...) — PUT /projects/:id/tasks/:taskId */
export async function updateTask(
  projectId: string,
  taskId: string,
  body: UpdateTaskBody
): Promise<ApiResponse<{ task: TaskDetail }>> {
  if (USE_MOCK) return mock.updateTask(projectId, taskId, body);
  return request(`/projects/${projectId}/tasks/${taskId}`, "PUT", body);
}

/** Delete a task — DELETE /projects/:id/tasks/:taskId */
export async function deleteTask(projectId: string, taskId: string): Promise<ApiResponse> {
  if (USE_MOCK) return mock.deleteTask(projectId, taskId);
  return request(`/projects/${projectId}/tasks/${taskId}`, "DELETE");
}

// ============================================================================
//  COMMENTS
// ============================================================================

/** A task's comments — GET /projects/:id/tasks/:taskId/comments */
export async function getComments(
  projectId: string,
  taskId: string
): Promise<ApiResponse<{ comments: CommentDetail[] }>> {
  if (USE_MOCK) return mock.getComments(projectId, taskId);
  return request(`/projects/${projectId}/tasks/${taskId}/comments`);
}

/** A comment — GET /projects/:id/tasks/:taskId/comments/:commentId */
export async function getComment(
  projectId: string,
  taskId: string,
  commentId: string
): Promise<ApiResponse<{ comment: CommentDetail }>> {
  if (USE_MOCK) return mock.getComment(projectId, taskId, commentId);
  return request(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
}

/** Add a comment — POST /projects/:id/tasks/:taskId/comments */
export async function createComment(
  projectId: string,
  taskId: string,
  body: CommentBody
): Promise<ApiResponse<{ comment: CommentDetail }>> {
  if (USE_MOCK) return mock.createComment(projectId, taskId, body);
  return request(`/projects/${projectId}/tasks/${taskId}/comments`, "POST", body);
}

/** Update a comment — PUT /projects/:id/tasks/:taskId/comments/:commentId */
export async function updateComment(
  projectId: string,
  taskId: string,
  commentId: string,
  body: CommentBody
): Promise<ApiResponse<{ comment: CommentDetail }>> {
  if (USE_MOCK) return mock.updateComment(projectId, taskId, commentId, body);
  return request(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, "PUT", body);
}

/** Delete a comment — DELETE /projects/:id/tasks/:taskId/comments/:commentId */
export async function deleteComment(
  projectId: string,
  taskId: string,
  commentId: string
): Promise<ApiResponse> {
  if (USE_MOCK) return mock.deleteComment(projectId, taskId, commentId);
  return request(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, "DELETE");
}

// ============================================================================
//  DASHBOARD
// ============================================================================

/** The tasks assigned to me — GET /dashboard/assigned-tasks */
export async function getAssignedTasks(): Promise<ApiResponse<{ tasks: AssignedTask[] }>> {
  if (USE_MOCK) return mock.getAssignedTasks();
  return request("/dashboard/assigned-tasks");
}

/** The projects where I have tasks, with those tasks — GET /dashboard/projects-with-tasks */
export async function getProjectsWithTasks(): Promise<
  ApiResponse<{ projects: DashboardProject[] }>
> {
  if (USE_MOCK) return mock.getProjectsWithTasks();
  return request("/dashboard/projects-with-tasks");
}

/** My statistics — GET /dashboard/stats */
export async function getDashboardStats(): Promise<ApiResponse<{ stats: DashboardStats }>> {
  if (USE_MOCK) return mock.getDashboardStats();
  return request("/dashboard/stats");
}
