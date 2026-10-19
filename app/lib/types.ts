/**
 * ============================================================================
 *  TYPES TYPESCRIPT
 * ============================================================================
 *  Ces types décrivent EXACTEMENT le JSON renvoyé par le backend Abricot.
 *  Ils ont été écrits à partir de :
 *    - prisma/schema.prisma           (la forme des "tables")
 *    - src/controllers/*.ts           (ce que chaque route renvoie)
 *
 *  ⚠️ Les dates arrivent toujours en texte (format ISO, ex : "2026-10-13T12:18:56.055Z")
 *     car le JSON ne connaît pas le type Date. Pour les afficher, utilise
 *     formatDate() dans utils.ts.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// Valeurs possibles (identiques au backend)
// ----------------------------------------------------------------------------
export type Role = "ADMIN" | "CONTRIBUTOR";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// ----------------------------------------------------------------------------
// Format de TOUTES les réponses du backend (voir src/utils/response.ts)
// ----------------------------------------------------------------------------
export interface ValidationError {
  field: string;
  message: string;
}

/** Réponse quand tout s'est bien passé */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

/** Réponse quand il y a une erreur (403, 404, données invalides...) */
export interface ApiError {
  success: false;
  message: string; // message lisible, ex : "Accès refusé au projet"
  error?: string; // code d'erreur, ex : "FORBIDDEN", "PROJECT_NOT_FOUND"
  data?: { errors: ValidationError[] }; // seulement pour les erreurs de validation
}

/**
 * Une réponse est SOIT un succès, SOIT une erreur.
 * Astuce : après `if (!response.success) return ...`, TypeScript sait que
 * `response.data` existe forcément.
 */
export type ApiResponse<T = undefined> = ApiSuccess<T> | ApiError;

// ----------------------------------------------------------------------------
// Les "tables" de la base de données (schema.prisma)
// ----------------------------------------------------------------------------
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  // (le mot de passe n'est jamais renvoyé par l'API)
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

/** Un commentaire (appelé "Comment" dans Prisma) */
export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  authorId: string;
}

// ----------------------------------------------------------------------------
// Formes "enrichies" renvoyées par les routes
// ----------------------------------------------------------------------------

/** Un utilisateur résumé (utilisé partout : owner, creator, author...) */
export interface UserSummary {
  id: string;
  email: string;
  name: string | null;
}

export interface ProjectMemberWithUser extends ProjectMember {
  user: UserSummary;
}

/** POST /projects et PUT /projects/:id */
export interface ProjectWithRelations extends Project {
  owner: UserSummary;
  members: ProjectMemberWithUser[]; // ⚠️ le propriétaire n'est PAS dans members
  _count: { tasks: number };
}

/** GET /projects (chaque élément de la liste) */
export interface ProjectWithRole extends ProjectWithRelations {
  userRole: Role | null; // le propriétaire a le rôle "ADMIN"
}

export interface TaskWithCreator extends Task {
  creator: UserSummary;
}

/** GET /projects/:id */
export interface ProjectDetail extends ProjectWithRole {
  tasks: TaskWithCreator[]; // ⚠️ sans assignés ni commentaires (utilise getProjectTasks pour ça)
}

/** Les assignés tels que renvoyés par les routes /tasks */
export interface TaskAssigneeSummary {
  id: string;
  assignedAt: string;
  user: UserSummary;
}

/** Les commentaires tels que renvoyés par les routes /tasks */
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

/** Routes /projects/:id/tasks/:taskId/comments */
export interface CommentDetail extends TaskComment {
  author: UserSummary;
  task: { id: string; title: string };
}

// ----------------------------------------------------------------------------
// Tableau de bord (/dashboard/...)
// ----------------------------------------------------------------------------
export interface TaskAssigneeWithUser extends TaskAssignee {
  user: UserSummary;
}

export interface TaskCommentWithAuthor extends TaskComment {
  author: UserSummary;
}

/** Une tâche dans les routes du dashboard */
export interface DashboardTask extends Task {
  assignees: TaskAssigneeWithUser[];
  comments: TaskCommentWithAuthor[]; // du plus récent au plus ancien
}

/** GET /dashboard/assigned-tasks */
export interface AssignedTask extends DashboardTask {
  project: { id: string; name: string; description: string | null };
}

/** GET /dashboard/projects-with-tasks */
export interface DashboardProject extends Project {
  owner: UserSummary;
  tasks: DashboardTask[]; // uniquement les tâches assignées à l'utilisateur connecté
}

/** GET /dashboard/stats */
export interface DashboardStats {
  tasks: {
    total: number;
    urgent: number; // ⚠️ compte les priorités URGENT **et** HIGH
    overdue: number; // échéance dépassée et statut différent de DONE
    byStatus: Partial<Record<TaskStatus, number>>; // ex : { TODO: 2, IN_PROGRESS: 1 }
  };
  projects: { total: number };
}

// ----------------------------------------------------------------------------
// Authentification (/auth/...)
// ----------------------------------------------------------------------------
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

/** POST /auth/login et POST /auth/register */
export interface AuthData {
  user: AuthUser;
  token: string; // le token JWT à envoyer ensuite dans "Authorization: Bearer <token>"
}

/** GET /auth/profile */
export interface ProfileUser {
  id: string;
  email: string;
  name?: string; // absent si l'utilisateur n'a pas de nom
}

// ----------------------------------------------------------------------------
// Corps des requêtes (ce qu'on ENVOIE au backend)
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
  contributors?: string[]; // liste d'emails
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
  dueDate?: string; // date ISO, ex : "2026-11-30" ou "2026-11-30T00:00:00.000Z"
  assigneeIds?: string[]; // IDs des utilisateurs (doivent être membres du projet)
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  assigneeIds?: string[]; // remplace TOUS les assignés existants
}

export interface CommentBody {
  content: string;
}
