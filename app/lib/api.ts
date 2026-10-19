/**
 * ============================================================================
 *  API — LE SEUL FICHIER QUE TES PAGES DOIVENT UTILISER
 * ============================================================================
 *  Chaque fonction regarde la variable USE_MOCK du fichier .env.local :
 *    - USE_MOCK=true  → renvoie les fausses données (mock-api.ts)
 *    - USE_MOCK=false → appelle le vrai backend (URL_API)
 *  Dans les deux cas, la réponse a EXACTEMENT la même forme :
 *    { success: true,  message: "...", data: {...} }
 *    { success: false, message: "...", error: "CODE_ERREUR" }
 *
 *  ⚠️ Ces fonctions s'utilisent côté SERVEUR uniquement :
 *     - dans un Server Component (une page/composant SANS "use client")
 *     - ou dans une Server Action ("use server")
 *     Les variables USE_MOCK et URL_API n'existent pas dans le navigateur.
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

/** Nom du cookie dans lequel on rangera le token JWT après la connexion */
export const TOKEN_COOKIE_NAME = "token";

/**
 * Envoie une requête au VRAI backend (utilisé seulement si USE_MOCK=false).
 * Ajoute automatiquement le token JWT (lu dans le cookie "token") s'il existe.
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
      cache: "no-store", // toujours des données fraîches
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
//  AUTHENTIFICATION
// ============================================================================

/** Inscription — POST /auth/register */
export async function register(body: RegisterBody): Promise<ApiResponse<AuthData>> {
  if (USE_MOCK) return mock.register(body);
  return request("/auth/register", "POST", body);
}

/** Connexion — POST /auth/login */
export async function login(body: LoginBody): Promise<ApiResponse<AuthData>> {
  if (USE_MOCK) return mock.login(body);
  return request("/auth/login", "POST", body);
}

/** Profil de l'utilisateur connecté — GET /auth/profile */
export async function getProfile(): Promise<ApiResponse<{ user: ProfileUser }>> {
  if (USE_MOCK) return mock.getProfile();
  return request("/auth/profile");
}

/** Modifier son nom / email — PUT /auth/profile */
export async function updateProfile(
  body: UpdateProfileBody
): Promise<ApiResponse<{ user: User }>> {
  if (USE_MOCK) return mock.updateProfile(body);
  return request("/auth/profile", "PUT", body);
}

/** Modifier son mot de passe — PUT /auth/password */
export async function updatePassword(body: UpdatePasswordBody): Promise<ApiResponse> {
  if (USE_MOCK) return mock.updatePassword(body);
  return request("/auth/password", "PUT", body);
}

// ============================================================================
//  PROJETS
// ============================================================================

/** Mes projets (propriétaire ou membre) — GET /projects */
export async function getProjects(): Promise<ApiResponse<{ projects: ProjectWithRole[] }>> {
  if (USE_MOCK) return mock.getProjects();
  return request("/projects");
}

/** Un projet avec ses membres et ses tâches (sans assignés) — GET /projects/:id */
export async function getProject(
  projectId: string
): Promise<ApiResponse<{ project: ProjectDetail }>> {
  if (USE_MOCK) return mock.getProject(projectId);
  return request(`/projects/${projectId}`);
}

/** Créer un projet — POST /projects */
export async function createProject(
  body: CreateProjectBody
): Promise<ApiResponse<{ project: ProjectWithRelations }>> {
  if (USE_MOCK) return mock.createProject(body);
  return request("/projects", "POST", body);
}

/** Modifier un projet — PUT /projects/:id */
export async function updateProject(
  projectId: string,
  body: UpdateProjectBody
): Promise<ApiResponse<{ project: ProjectWithRelations }>> {
  if (USE_MOCK) return mock.updateProject(projectId, body);
  return request(`/projects/${projectId}`, "PUT", body);
}

/** Supprimer un projet — DELETE /projects/:id */
export async function deleteProject(projectId: string): Promise<ApiResponse> {
  if (USE_MOCK) return mock.deleteProject(projectId);
  return request(`/projects/${projectId}`, "DELETE");
}

/** Ajouter un contributeur (par email) — POST /projects/:id/contributors */
export async function addContributor(
  projectId: string,
  body: AddContributorBody
): Promise<ApiResponse> {
  if (USE_MOCK) return mock.addContributor(projectId, body);
  return request(`/projects/${projectId}/contributors`, "POST", body);
}

/** Retirer un contributeur — DELETE /projects/:id/contributors/:userId */
export async function removeContributor(
  projectId: string,
  userId: string
): Promise<ApiResponse> {
  if (USE_MOCK) return mock.removeContributor(projectId, userId);
  return request(`/projects/${projectId}/contributors/${userId}`, "DELETE");
}

// ============================================================================
//  UTILISATEURS
// ============================================================================

/** Rechercher des utilisateurs par nom ou email — GET /users/search?query=... */
export async function searchUsers(
  query: string
): Promise<ApiResponse<{ users: UserSummary[] }>> {
  if (USE_MOCK) return mock.searchUsers(query);
  return request(`/users/search?query=${encodeURIComponent(query)}`);
}

// ============================================================================
//  TÂCHES
// ============================================================================

/** Les tâches d'un projet, avec assignés et commentaires — GET /projects/:id/tasks */
export async function getProjectTasks(
  projectId: string
): Promise<ApiResponse<{ tasks: TaskDetail[] }>> {
  if (USE_MOCK) return mock.getProjectTasks(projectId);
  return request(`/projects/${projectId}/tasks`);
}

/** Une tâche — GET /projects/:id/tasks/:taskId */
export async function getTask(
  projectId: string,
  taskId: string
): Promise<ApiResponse<{ task: TaskDetail }>> {
  if (USE_MOCK) return mock.getTask(projectId, taskId);
  return request(`/projects/${projectId}/tasks/${taskId}`);
}

/** Créer une tâche — POST /projects/:id/tasks */
export async function createTask(
  projectId: string,
  body: CreateTaskBody
): Promise<ApiResponse<{ task: TaskDetail }>> {
  if (USE_MOCK) return mock.createTask(projectId, body);
  return request(`/projects/${projectId}/tasks`, "POST", body);
}

/** Modifier une tâche (titre, statut, assignés...) — PUT /projects/:id/tasks/:taskId */
export async function updateTask(
  projectId: string,
  taskId: string,
  body: UpdateTaskBody
): Promise<ApiResponse<{ task: TaskDetail }>> {
  if (USE_MOCK) return mock.updateTask(projectId, taskId, body);
  return request(`/projects/${projectId}/tasks/${taskId}`, "PUT", body);
}

/** Supprimer une tâche — DELETE /projects/:id/tasks/:taskId */
export async function deleteTask(projectId: string, taskId: string): Promise<ApiResponse> {
  if (USE_MOCK) return mock.deleteTask(projectId, taskId);
  return request(`/projects/${projectId}/tasks/${taskId}`, "DELETE");
}

// ============================================================================
//  COMMENTAIRES
// ============================================================================

/** Les commentaires d'une tâche — GET /projects/:id/tasks/:taskId/comments */
export async function getComments(
  projectId: string,
  taskId: string
): Promise<ApiResponse<{ comments: CommentDetail[] }>> {
  if (USE_MOCK) return mock.getComments(projectId, taskId);
  return request(`/projects/${projectId}/tasks/${taskId}/comments`);
}

/** Un commentaire — GET /projects/:id/tasks/:taskId/comments/:commentId */
export async function getComment(
  projectId: string,
  taskId: string,
  commentId: string
): Promise<ApiResponse<{ comment: CommentDetail }>> {
  if (USE_MOCK) return mock.getComment(projectId, taskId, commentId);
  return request(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
}

/** Ajouter un commentaire — POST /projects/:id/tasks/:taskId/comments */
export async function createComment(
  projectId: string,
  taskId: string,
  body: CommentBody
): Promise<ApiResponse<{ comment: CommentDetail }>> {
  if (USE_MOCK) return mock.createComment(projectId, taskId, body);
  return request(`/projects/${projectId}/tasks/${taskId}/comments`, "POST", body);
}

/** Modifier un commentaire — PUT /projects/:id/tasks/:taskId/comments/:commentId */
export async function updateComment(
  projectId: string,
  taskId: string,
  commentId: string,
  body: CommentBody
): Promise<ApiResponse<{ comment: CommentDetail }>> {
  if (USE_MOCK) return mock.updateComment(projectId, taskId, commentId, body);
  return request(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, "PUT", body);
}

/** Supprimer un commentaire — DELETE /projects/:id/tasks/:taskId/comments/:commentId */
export async function deleteComment(
  projectId: string,
  taskId: string,
  commentId: string
): Promise<ApiResponse> {
  if (USE_MOCK) return mock.deleteComment(projectId, taskId, commentId);
  return request(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, "DELETE");
}

// ============================================================================
//  TABLEAU DE BORD
// ============================================================================

/** Les tâches qui me sont assignées — GET /dashboard/assigned-tasks */
export async function getAssignedTasks(): Promise<ApiResponse<{ tasks: AssignedTask[] }>> {
  if (USE_MOCK) return mock.getAssignedTasks();
  return request("/dashboard/assigned-tasks");
}

/** Les projets où j'ai des tâches, avec ces tâches — GET /dashboard/projects-with-tasks */
export async function getProjectsWithTasks(): Promise<
  ApiResponse<{ projects: DashboardProject[] }>
> {
  if (USE_MOCK) return mock.getProjectsWithTasks();
  return request("/dashboard/projects-with-tasks");
}

/** Mes statistiques — GET /dashboard/stats */
export async function getDashboardStats(): Promise<ApiResponse<{ stats: DashboardStats }>> {
  if (USE_MOCK) return mock.getDashboardStats();
  return request("/dashboard/stats");
}
