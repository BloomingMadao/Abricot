/**
 * ============================================================================
 *  TYPESCRIPT TYPES
 * ============================================================================
 *  These types describe EXACTLY the JSON returned by the Abricot backend.
 *  They were written based on:
 *    - prisma/schema.prisma           (the shape of the "tables")
 *    - src/controllers/*.ts           (what each route returns)
 *
 *  ⚠️ Dates always arrive as text (ISO format, e.g. "2026-10-13T12:18:56.055Z")
 *     because JSON has no Date type. To display them, use
 *     formatDate() in utils.ts.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// Possible values (identical to the backend)
// ----------------------------------------------------------------------------
export type Role = "ADMIN" | "CONTRIBUTOR";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// ----------------------------------------------------------------------------
// Format of ALL backend responses (see src/utils/response.ts)
// ----------------------------------------------------------------------------
export interface ValidationError {
  field: string;
  message: string;
}

/** Response when everything went well */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

/** Response when there's an error (403, 404, invalid data...) */
export interface ApiError {
  success: false;
  message: string; // human-readable message, e.g. "Accès refusé au projet"
  error?: string; // error code, e.g. "FORBIDDEN", "PROJECT_NOT_FOUND"
  data?: { errors: ValidationError[] }; // only for validation errors
}

/**
 * A response is EITHER a success OR an error.
 * Tip: after `if (!response.success) return ...`, TypeScript knows that
 * `response.data` necessarily exists.
 */
export type ApiResponse<T = undefined> = ApiSuccess<T> | ApiError;

// ----------------------------------------------------------------------------
// The database "tables" (schema.prisma)
// ----------------------------------------------------------------------------
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  // (the password is never returned by the API)
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface ProjectMember {
  id: string;
  role: Role;
  joinedAt: string;
  userId: string;
  projectId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  creatorId: string;
}

export interface TaskAssignee {
  id: string;
  assignedAt: string;
  taskId: string;
  userId: string;
}

/** A comment (called "Comment" in Prisma) */
export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  authorId: string;
}

// ----------------------------------------------------------------------------
// "Enriched" shapes returned by the routes
// ----------------------------------------------------------------------------

/** A summarized user (used everywhere: owner, creator, author...) */
export interface UserSummary {
  id: string;
  email: string;
  name: string | null;
}

export interface ProjectMemberWithUser extends ProjectMember {
  user: UserSummary;
}

/** POST /projects and PUT /projects/:id */
export interface ProjectWithRelations extends Project {
  owner: UserSummary;
  members: ProjectMemberWithUser[]; // ⚠️ the owner is NOT in members
  _count: { tasks: number };
}

/** GET /projects (each item in the list) */
export interface ProjectWithRole extends ProjectWithRelations {
  userRole: Role | null; // the owner has the "ADMIN" role
}

export interface TaskWithCreator extends Task {
  creator: UserSummary;
}

/** GET /projects/:id */
export interface ProjectDetail extends ProjectWithRole {
  tasks: TaskWithCreator[]; // ⚠️ without assignees or comments (use getProjectTasks for that)
}

/** Assignees as returned by the /tasks routes */
export interface TaskAssigneeSummary {
  id: string;
  assignedAt: string;
  user: UserSummary;
}

/** Comments as returned by the /tasks routes */
export interface TaskCommentSummary {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: UserSummary;
}

/** GET/POST/PUT /projects/:id/tasks(/:taskId) */
export interface TaskDetail extends Task {
  creator: UserSummary;
  project: { id: string; name: string };
  assignees: TaskAssigneeSummary[];
  comments: TaskCommentSummary[];
}

/** /projects/:id/tasks/:taskId/comments routes */
export interface CommentDetail extends TaskComment {
  author: UserSummary;
  task: { id: string; title: string };
}

// ----------------------------------------------------------------------------
// Dashboard (/dashboard/...)
// ----------------------------------------------------------------------------
export interface TaskAssigneeWithUser extends TaskAssignee {
  user: UserSummary;
}

export interface TaskCommentWithAuthor extends TaskComment {
  author: UserSummary;
}

/** A task in the dashboard routes */
export interface DashboardTask extends Task {
  assignees: TaskAssigneeWithUser[];
  comments: TaskCommentWithAuthor[]; // from newest to oldest
}

/** GET /dashboard/assigned-tasks */
export interface AssignedTask extends DashboardTask {
  project: { id: string; name: string; description: string | null };
}

/** GET /dashboard/projects-with-tasks */
export interface DashboardProject extends Project {
  owner: UserSummary;
  tasks: DashboardTask[]; // only the tasks assigned to the logged-in user
}

/** GET /dashboard/stats */
export interface DashboardStats {
  tasks: {
    total: number;
    urgent: number; // ⚠️ counts URGENT **and** HIGH priorities
    overdue: number; // due date passed and status other than DONE
    byStatus: Partial<Record<TaskStatus, number>>; // e.g. { TODO: 2, IN_PROGRESS: 1 }
  };
  projects: { total: number };
}

// ----------------------------------------------------------------------------
// Authentication (/auth/...)
// ----------------------------------------------------------------------------
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

/** POST /auth/login and POST /auth/register */
export interface AuthData {
  user: AuthUser;
  token: string; // the JWT token to send afterwards in "Authorization: Bearer <token>"
}

/** GET /auth/profile */
export interface ProfileUser {
  id: string;
  email: string;
  name?: string; // missing if the user has no name
}

// ----------------------------------------------------------------------------
// Request bodies (what we SEND to the backend)
// ----------------------------------------------------------------------------
export interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface UpdateProfileBody {
  name?: string;
  email?: string;
}

export interface UpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface CreateProjectBody {
  name: string;
  description?: string;
  contributors?: string[]; // list of emails
}

export interface UpdateProjectBody {
  name?: string;
  description?: string;
}

export interface AddContributorBody {
  email: string;
  role?: Role;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string; // ISO date, e.g. "2026-11-30" or "2026-11-30T00:00:00.000Z"
  assigneeIds?: string[]; // User IDs (must be project members)
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  assigneeIds?: string[]; // replaces ALL existing assignees
}

export interface CommentBody {
  content: string;
}
