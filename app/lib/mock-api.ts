/**
 * ============================================================================
 *  FAUSSE API (MOCK)
 * ============================================================================
 *  Chaque fonction de ce fichier imite UNE route du backend : elle lit (ou
 *  modifie) les données de mock-data.ts et renvoie EXACTEMENT le même JSON
 *  que le vrai backend, avec les mêmes messages et codes d'erreur.
 *
 *  ⚠️ N'importe pas ce fichier dans tes pages : passe toujours par api.ts,
 *     qui choisit automatiquement entre ce mock et le vrai backend.
 * ============================================================================
 */

import { connection } from "next/server";
import type {
  ApiResponse,
  ApiSuccess,
  ApiError,
  ValidationError,
  Role,
  Task,
  TaskStatus,
  TaskComment,
  Project,
  UserSummary,
  ProjectMemberWithUser,
  ProjectWithRelations,
  ProjectWithRole,
  ProjectDetail,
  TaskDetail,
  CommentDetail,
  DashboardTask,
  AssignedTask,
  DashboardProject,
  DashboardStats,
  AuthData,
  ProfileUser,
  User,
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
import {
  users,
  projects,
  projectMembers,
  tasks,
  taskAssignees,
  comments,
  MOCK_DEFAULT_USER_ID,
  MOCK_DELAY_MS,
  type MockUser,
} from "./mock-data";

/** L'utilisateur actuellement "connecté" dans le mock (change après login/register) */
let currentUserId = MOCK_DEFAULT_USER_ID;

// ============================================================================
//  OUTILS INTERNES
// ============================================================================

/** Appelé au début de chaque fonction du mock */
async function wait(): Promise<void> {
  // Comme avec le vrai backend, la page est recalculée à chaque visite
  // (sinon Next.js pourrait "figer" les fausses données au moment du build)
  await connection();
  // Simule le temps de réponse du réseau
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

const now = () => new Date().toISOString();

/** Génère un identifiant unique (le backend utilise des "cuid") */
const newId = () =>
  `mock${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

/** Faux token renvoyé par login/register en mode mock */
const fakeToken = (userId: string) => `mock-token-${userId}`;

/** Passe les données par JSON, comme si elles venaient du réseau.
 *  (Ça crée aussi une copie : ta page ne peut pas modifier les données du mock par erreur.) */
const toJson = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/** Réponse de succès (comme sendSuccess dans le backend) */
function ok<T>(message: string, data: T): ApiSuccess<T> {
  return toJson({ success: true, message, data });
}

/** Réponse d'erreur (comme sendError dans le backend) */
function fail(message: string, error: string): ApiError {
  return { success: false, message, error };
}

/** Réponse d'erreur de validation (comme sendValidationError dans le backend) */
function invalid(message: string, errors: ValidationError[]): ApiError {
  return { success: false, message, error: "Validation failed", data: { errors } };
}

/** Supprime d'un tableau tous les éléments qui respectent une condition */
function removeWhere<T>(array: T[], predicate: (item: T) => boolean): void {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) array.splice(i, 1);
  }
}

/** Compare deux textes comme la base SQLite (ordre alphabétique, null en premier) */
function compare(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  return a < b ? -1 : 1;
}

// Règles de validation (copiées de src/utils/validation.ts)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];
const isValidDate = (value: string) => !isNaN(new Date(value).getTime());

// ----------------------------------------------------------------------------
// Recherches dans les "tables"
// ----------------------------------------------------------------------------
const findUser = (id: string) => users.find((u) => u.id === id);
const findUserByEmail = (email: string) =>
  users.find((u) => u.email === email.toLowerCase());
const findProject = (id: string) => projects.find((p) => p.id === id);
const findTask = (projectId: string, taskId: string) =>
  tasks.find((t) => t.id === taskId && t.projectId === projectId);
const findComment = (projectId: string, taskId: string, commentId: string) =>
  findTask(projectId, taskId)
    ? comments.find((c) => c.id === commentId && c.taskId === taskId)
    : undefined;
const isAssignedTo = (taskId: string, userId: string) =>
  taskAssignees.some((a) => a.taskId === taskId && a.userId === userId);

// ----------------------------------------------------------------------------
// Permissions (copiées de src/utils/permissions.ts)
// ----------------------------------------------------------------------------

/** Rôle d'un utilisateur dans un projet : le propriétaire est "ADMIN", null = aucun accès */
function getUserRole(userId: string, projectId: string): Role | null {
  const project = findProject(projectId);
  if (!project) return null;
  if (project.ownerId === userId) return "ADMIN";
  const membership = projectMembers.find(
    (m) => m.userId === userId && m.projectId === projectId
  );
  return membership ? membership.role : null;
}

const hasProjectAccess = (userId: string, projectId: string) =>
  getUserRole(userId, projectId) !== null;
const isProjectAdmin = (userId: string, projectId: string) =>
  getUserRole(userId, projectId) === "ADMIN";
const isProjectOwner = (userId: string, projectId: string) =>
  findProject(projectId)?.ownerId === userId;

// ----------------------------------------------------------------------------
// Construction des objets "enrichis" (l'équivalent des "include" de Prisma)
// ----------------------------------------------------------------------------
function toUserSummary(userId: string): UserSummary {
  const user = findUser(userId);
  return { id: userId, email: user?.email ?? "", name: user?.name ?? null };
}

function buildMembers(projectId: string): ProjectMemberWithUser[] {
  return projectMembers
    .filter((m) => m.projectId === projectId)
    .map((m) => ({ ...m, user: toUserSummary(m.userId) }));
}

function buildProject(project: Project): ProjectWithRelations {
  return {
    ...project,
    owner: toUserSummary(project.ownerId),
    members: buildMembers(project.id),
    _count: { tasks: tasks.filter((t) => t.projectId === project.id).length },
  };
}

function buildTaskDetail(task: Task): TaskDetail {
  return {
    ...task,
    creator: toUserSummary(task.creatorId),
    project: { id: task.projectId, name: findProject(task.projectId)?.name ?? "" },
    assignees: taskAssignees
      .filter((a) => a.taskId === task.id)
      .sort((a, b) => compare(a.userId, b.userId)) // même ordre que la base SQLite
      .map((a) => ({ id: a.id, assignedAt: a.assignedAt, user: toUserSummary(a.userId) })),
    comments: comments
      .filter((c) => c.taskId === task.id)
      .sort((a, b) => compare(a.createdAt, b.createdAt)) // du plus ancien au plus récent
      .map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        author: toUserSummary(c.authorId),
      })),
  };
}

function buildCommentDetail(comment: TaskComment): CommentDetail {
  const task = tasks.find((t) => t.id === comment.taskId);
  return {
    ...comment,
    author: toUserSummary(comment.authorId),
    task: { id: comment.taskId, title: task?.title ?? "" },
  };
}

function buildDashboardTask(task: Task): DashboardTask {
  return {
    ...task,
    assignees: taskAssignees
      .filter((a) => a.taskId === task.id)
      .sort((a, b) => compare(a.userId, b.userId)) // même ordre que la base SQLite
      .map((a) => ({ ...a, user: toUserSummary(a.userId) })),
    comments: comments
      .filter((c) => c.taskId === task.id)
      .sort((a, b) => compare(b.createdAt, a.createdAt)) // du plus récent au plus ancien
      .map((c) => ({ ...c, author: toUserSummary(c.authorId) })),
  };
}

/** Tri du dashboard : priorité puis date d'échéance.
 *  ⚠️ Comme dans le backend, la priorité est triée par ordre ALPHABÉTIQUE
 *     (HIGH, LOW, MEDIUM, URGENT) et pas par importance. */
const dashboardOrder = (a: Task, b: Task) =>
  compare(a.priority, b.priority) || compare(a.dueDate, b.dueDate);

/** Remplace tous les assignés d'une tâche */
function setTaskAssignees(taskId: string, userIds: string[]): void {
  removeWhere(taskAssignees, (a) => a.taskId === taskId);
  for (const userId of userIds) {
    taskAssignees.push({ id: newId(), assignedAt: now(), taskId, userId });
  }
}

/** Valide les champs d'une tâche (création ET modification) */
function validateTask(
  body: Partial<UpdateTaskBody>,
  isCreation: boolean
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { title, description, status, priority, dueDate, assigneeIds } = body;

  if (isCreation && !title) {
    errors.push({ field: "title", message: "Le titre de la tâche est requis" });
  } else if (title !== undefined) {
    if (!title.trim()) {
      errors.push({ field: "title", message: "Le titre de la tâche ne peut pas être vide" });
    } else if (title.trim().length < 2) {
      errors.push({ field: "title", message: "Le titre de la tâche doit contenir au moins 2 caractères" });
    } else if (title.trim().length > 200) {
      errors.push({ field: "title", message: "Le titre de la tâche ne peut pas dépasser 200 caractères" });
    }
  }
  if (description && description.trim().length > 1000) {
    errors.push({ field: "description", message: "La description ne peut pas dépasser 1000 caractères" });
  }
  if (status && !STATUSES.includes(status)) {
    errors.push({ field: "status", message: "Le statut doit être TODO, IN_PROGRESS, DONE ou CANCELLED" });
  }
  if (priority && !PRIORITIES.includes(priority)) {
    errors.push({ field: "priority", message: "La priorité doit être LOW, MEDIUM, HIGH ou URGENT" });
  }
  if (dueDate && !isValidDate(dueDate)) {
    errors.push({ field: "dueDate", message: "Format de date invalide (utilisez le format ISO)" });
  }
  if (assigneeIds !== undefined) {
    if (!Array.isArray(assigneeIds)) {
      errors.push({ field: "assigneeIds", message: "Les assignations doivent être un tableau" });
    } else {
      assigneeIds.forEach((userId, index) => {
        if (!userId) {
          errors.push({ field: `assigneeIds[${index}]`, message: "L'ID de l'utilisateur assigné est invalide" });
        }
      });
    }
  }
  return errors;
}

/** Valide le contenu d'un commentaire */
function validateComment(content: string | undefined): ValidationError[] {
  if (!content) {
    return [{ field: "content", message: "Le contenu du commentaire est requis" }];
  }
  if (content.trim().length < 1) {
    return [{ field: "content", message: "Le contenu du commentaire ne peut pas être vide" }];
  }
  if (content.trim().length > 2000) {
    return [{ field: "content", message: "Le contenu du commentaire ne peut pas dépasser 2000 caractères" }];
  }
  return [];
}

// ============================================================================
//  AUTHENTIFICATION  (/auth/...)
// ============================================================================

/** POST /auth/register */
export async function register(body: RegisterBody): Promise<ApiResponse<AuthData>> {
  await wait();
  const { email, password, name } = body;

  const errors: ValidationError[] = [];
  if (!email) errors.push({ field: "email", message: "L'email est requis" });
  else if (!EMAIL_REGEX.test(email)) errors.push({ field: "email", message: "Format d'email invalide" });
  if (!password) errors.push({ field: "password", message: "Le mot de passe est requis" });
  else if (!PASSWORD_REGEX.test(password))
    errors.push({
      field: "password",
      message:
        "Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)",
    });
  if (name && name.trim().length < 2)
    errors.push({ field: "name", message: "Le nom doit contenir au moins 2 caractères" });
  if (errors.length > 0) return invalid("Données d'inscription invalides", errors);

  if (findUserByEmail(email)) {
    return fail("Un utilisateur avec cet email existe déjà", "EMAIL_ALREADY_EXISTS");
  }

  const date = now();
  const user: MockUser = {
    id: newId(),
    email: email.toLowerCase(),
    name: name?.trim() || null,
    password,
    createdAt: date,
    updatedAt: date,
  };
  users.push(user);
  currentUserId = user.id; // le nouvel utilisateur devient l'utilisateur connecté

  return ok("Utilisateur créé avec succès", {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    token: fakeToken(user.id),
  });
}

/** POST /auth/login */
export async function login(body: LoginBody): Promise<ApiResponse<AuthData>> {
  await wait();
  const { email, password } = body;

  const errors: ValidationError[] = [];
  if (!email) errors.push({ field: "email", message: "L'email est requis" });
  if (!password) errors.push({ field: "password", message: "Le mot de passe est requis" });
  if (errors.length > 0) return invalid("Données de connexion invalides", errors);

  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return fail("Email ou mot de passe incorrect", "INVALID_CREDENTIALS");
  }
  currentUserId = user.id; // cet utilisateur devient l'utilisateur connecté

  return ok("Connexion réussie", {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    token: fakeToken(user.id),
  });
}

/** GET /auth/profile */
export async function getProfile(): Promise<ApiResponse<{ user: ProfileUser }>> {
  await wait();
  const user = findUser(currentUserId);
  if (!user) return fail("Utilisateur non trouvé", "Authentication failed");

  return ok("Profil récupéré avec succès", {
    user: { id: user.id, email: user.email, name: user.name || undefined },
  });
}

/** PUT /auth/profile */
export async function updateProfile(
  body: UpdateProfileBody
): Promise<ApiResponse<{ user: User }>> {
  await wait();
  const { name, email } = body;

  const errors: ValidationError[] = [];
  if (email !== undefined) {
    if (!email.trim()) errors.push({ field: "email", message: "L'email ne peut pas être vide" });
    else if (!EMAIL_REGEX.test(email)) errors.push({ field: "email", message: "Format d'email invalide" });
  }
  if (name !== undefined && name.trim().length < 2) {
    errors.push({ field: "name", message: "Le nom doit contenir au moins 2 caractères" });
  }
  if (errors.length > 0) return invalid("Données de mise à jour invalides", errors);

  const user = findUser(currentUserId);
  if (!user) return fail("Utilisateur non authentifié", "UNAUTHORIZED");

  if (email && email.toLowerCase() !== user.email.toLowerCase() && findUserByEmail(email)) {
    return fail("Un utilisateur avec cet email existe déjà", "EMAIL_ALREADY_EXISTS");
  }

  if (name !== undefined) user.name = name.trim() || null;
  if (email !== undefined) user.email = email.toLowerCase();
  user.updatedAt = now();

  return ok("Profil mis à jour avec succès", {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
}

/** PUT /auth/password */
export async function updatePassword(body: UpdatePasswordBody): Promise<ApiResponse> {
  await wait();
  const { currentPassword, newPassword } = body;

  const errors: ValidationError[] = [];
  if (!currentPassword)
    errors.push({ field: "currentPassword", message: "Le mot de passe actuel est requis" });
  if (!newPassword)
    errors.push({ field: "newPassword", message: "Le nouveau mot de passe est requis" });
  else if (!PASSWORD_REGEX.test(newPassword))
    errors.push({
      field: "newPassword",
      message:
        "Le nouveau mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule et un chiffre",
    });
  if (currentPassword && newPassword && currentPassword === newPassword)
    errors.push({
      field: "newPassword",
      message: "Le nouveau mot de passe doit être différent de l'actuel",
    });
  if (errors.length > 0)
    return invalid("Données de mise à jour du mot de passe invalides", errors);

  const user = findUser(currentUserId);
  if (!user) return fail("Utilisateur non trouvé", "USER_NOT_FOUND");
  if (user.password !== currentPassword) {
    return fail("Mot de passe actuel incorrect", "INVALID_CURRENT_PASSWORD");
  }

  user.password = newPassword;
  user.updatedAt = now();
  return ok("Mot de passe mis à jour avec succès", undefined);
}

// ============================================================================
//  PROJETS  (/projects/...)
// ============================================================================

/** GET /projects — les projets dont l'utilisateur est propriétaire ou membre */
export async function getProjects(): Promise<ApiResponse<{ projects: ProjectWithRole[] }>> {
  await wait();
  const result = projects
    .filter((p) => hasProjectAccess(currentUserId, p.id))
    .sort((a, b) => compare(b.updatedAt, a.updatedAt)) // du plus récemment modifié au plus ancien
    .map((p) => ({ ...buildProject(p), userRole: getUserRole(currentUserId, p.id) }));

  return ok("Projets récupérés avec succès", { projects: result });
}

/** GET /projects/:id */
export async function getProject(
  projectId: string
): Promise<ApiResponse<{ project: ProjectDetail }>> {
  await wait();
  // Comme le backend : un projet inexistant renvoie aussi "Accès refusé" (403)
  if (!hasProjectAccess(currentUserId, projectId)) {
    return fail("Accès refusé au projet", "FORBIDDEN");
  }
  const project = findProject(projectId);
  if (!project) return fail("Projet non trouvé", "PROJECT_NOT_FOUND");

  const projectTasks = tasks
    .filter((t) => t.projectId === projectId)
    .sort((a, b) => compare(b.createdAt, a.createdAt)) // de la plus récente à la plus ancienne
    .map((t) => ({ ...t, creator: toUserSummary(t.creatorId) }));

  return ok("Projet récupéré avec succès", {
    project: {
      ...buildProject(project),
      tasks: projectTasks,
      userRole: getUserRole(currentUserId, projectId),
    },
  });
}

/** POST /projects */
export async function createProject(
  body: CreateProjectBody
): Promise<ApiResponse<{ project: ProjectWithRelations }>> {
  await wait();
  const { name, description, contributors } = body;

  const errors: ValidationError[] = [];
  if (!name) errors.push({ field: "name", message: "Le nom du projet est requis" });
  else if (name.trim().length < 2)
    errors.push({ field: "name", message: "Le nom du projet doit contenir au moins 2 caractères" });
  else if (name.trim().length > 100)
    errors.push({ field: "name", message: "Le nom du projet ne peut pas dépasser 100 caractères" });
  if (description && description.trim().length > 500)
    errors.push({ field: "description", message: "La description ne peut pas dépasser 500 caractères" });
  if (contributors) {
    if (!Array.isArray(contributors)) {
      errors.push({ field: "contributors", message: "Les contributeurs doivent être un tableau" });
    } else {
      contributors.forEach((email, index) => {
        if (!EMAIL_REGEX.test(email))
          errors.push({ field: `contributors[${index}]`, message: "Format d'email invalide" });
      });
    }
  }
  if (errors.length > 0) return invalid("Données de création de projet invalides", errors);

  const date = now();
  const project: Project = {
    id: newId(),
    name: name.trim(),
    description: description?.trim() || null,
    createdAt: date,
    updatedAt: date,
    ownerId: currentUserId,
  };
  projects.push(project);

  // Ajout des contributeurs (les emails inconnus sont ignorés, comme dans le backend)
  for (const email of contributors ?? []) {
    const user = findUserByEmail(email);
    const alreadyMember = projectMembers.some(
      (m) => m.userId === user?.id && m.projectId === project.id
    );
    if (user && !alreadyMember) {
      projectMembers.push({
        id: newId(),
        role: "CONTRIBUTOR",
        joinedAt: now(),
        userId: user.id,
        projectId: project.id,
      });
    }
  }

  return ok("Projet créé avec succès", { project: buildProject(project) });
}

/** PUT /projects/:id — réservé au propriétaire et aux admins */
export async function updateProject(
  projectId: string,
  body: UpdateProjectBody
): Promise<ApiResponse<{ project: ProjectWithRelations }>> {
  await wait();
  const { name, description } = body;

  const errors: ValidationError[] = [];
  if (name !== undefined) {
    if (!name.trim())
      errors.push({ field: "name", message: "Le nom du projet ne peut pas être vide" });
    else if (name.trim().length < 2)
      errors.push({ field: "name", message: "Le nom du projet doit contenir au moins 2 caractères" });
    else if (name.trim().length > 100)
      errors.push({ field: "name", message: "Le nom du projet ne peut pas dépasser 100 caractères" });
  }
  if (description !== undefined && description.trim().length > 500)
    errors.push({ field: "description", message: "La description ne peut pas dépasser 500 caractères" });
  if (errors.length > 0) return invalid("Données de mise à jour invalides", errors);

  if (!isProjectAdmin(currentUserId, projectId)) {
    return fail("Vous n'avez pas les permissions pour modifier ce projet", "FORBIDDEN");
  }
  const project = findProject(projectId);
  if (!project) return fail("Projet non trouvé", "PROJECT_NOT_FOUND");

  if (name !== undefined) project.name = name.trim();
  if (description !== undefined) project.description = description.trim() || null;
  project.updatedAt = now();

  return ok("Projet mis à jour avec succès", { project: buildProject(project) });
}

/** DELETE /projects/:id — réservé au propriétaire */
export async function deleteProject(projectId: string): Promise<ApiResponse> {
  await wait();
  if (!isProjectOwner(currentUserId, projectId)) {
    return fail("Vous n'avez pas les permissions pour supprimer ce projet", "FORBIDDEN");
  }

  // Suppression "en cascade" : tâches, assignations, commentaires et membres du projet
  const taskIds = tasks.filter((t) => t.projectId === projectId).map((t) => t.id);
  removeWhere(comments, (c) => taskIds.includes(c.taskId));
  removeWhere(taskAssignees, (a) => taskIds.includes(a.taskId));
  removeWhere(tasks, (t) => t.projectId === projectId);
  removeWhere(projectMembers, (m) => m.projectId === projectId);
  removeWhere(projects, (p) => p.id === projectId);

  return ok("Projet supprimé avec succès", undefined);
}

/** POST /projects/:id/contributors — réservé au propriétaire et aux admins */
export async function addContributor(
  projectId: string,
  body: AddContributorBody
): Promise<ApiResponse> {
  await wait();
  const { email, role = "CONTRIBUTOR" } = body;

  if (!isProjectAdmin(currentUserId, projectId)) {
    return fail("Vous n'avez pas les permissions pour modifier ce projet", "FORBIDDEN");
  }
  const user = findUserByEmail(email ?? "");
  if (!user) return fail("Utilisateur non trouvé", "USER_NOT_FOUND");

  if (projectMembers.some((m) => m.userId === user.id && m.projectId === projectId)) {
    return fail("L'utilisateur est déjà membre de ce projet", "USER_ALREADY_MEMBER");
  }

  projectMembers.push({ id: newId(), role, joinedAt: now(), userId: user.id, projectId });
  return ok("Contributeur ajouté avec succès", undefined);
}

/** DELETE /projects/:id/contributors/:userId — réservé au propriétaire et aux admins */
export async function removeContributor(
  projectId: string,
  userId: string
): Promise<ApiResponse> {
  await wait();
  if (!isProjectAdmin(currentUserId, projectId)) {
    return fail("Vous n'avez pas les permissions pour modifier ce projet", "FORBIDDEN");
  }
  if (isProjectOwner(currentUserId, projectId) && currentUserId === userId) {
    return fail("Le propriétaire du projet ne peut pas se retirer", "CANNOT_REMOVE_OWNER");
  }

  removeWhere(projectMembers, (m) => m.userId === userId && m.projectId === projectId);
  return ok("Contributeur retiré avec succès", undefined);
}

// ============================================================================
//  UTILISATEURS  (/users/search)
// ============================================================================

/** GET /users/search?query=... — recherche par nom ou email (10 résultats max) */
export async function searchUsers(
  query: string
): Promise<ApiResponse<{ users: UserSummary[] }>> {
  await wait();
  if (!query) return fail("Paramètre de recherche requis", "MISSING_QUERY");

  const search = query.trim().toLowerCase();
  if (search.length < 2) {
    return fail("La recherche doit contenir au moins 2 caractères", "INVALID_QUERY");
  }

  const result = users
    .filter(
      (u) =>
        u.email.toLowerCase().includes(search) ||
        (u.name ?? "").toLowerCase().includes(search)
    )
    .sort((a, b) => compare(a.name, b.name) || compare(a.email, b.email))
    .slice(0, 10)
    .map((u) => toUserSummary(u.id));

  return ok("Utilisateurs trouvés", { users: result });
}

// ============================================================================
//  TÂCHES  (/projects/:id/tasks/...)
// ============================================================================

/** GET /projects/:id/tasks
 *  ⚠️ Comme le backend, le tri par priorité est ALPHABÉTIQUE inversé
 *     (URGENT, MEDIUM, LOW, HIGH), puis de la plus récente à la plus ancienne. */
export async function getProjectTasks(
  projectId: string
): Promise<ApiResponse<{ tasks: TaskDetail[] }>> {
  await wait();
  if (!hasProjectAccess(currentUserId, projectId)) {
    return fail("Accès refusé au projet", "FORBIDDEN");
  }

  const result = tasks
    .filter((t) => t.projectId === projectId)
    .sort((a, b) => compare(b.priority, a.priority) || compare(b.createdAt, a.createdAt))
    .map(buildTaskDetail);

  return ok("Tâches récupérées avec succès", { tasks: result });
}

/** GET /projects/:id/tasks/:taskId */
export async function getTask(
  projectId: string,
  taskId: string
): Promise<ApiResponse<{ task: TaskDetail }>> {
  await wait();
  if (!hasProjectAccess(currentUserId, projectId)) {
    return fail("Accès refusé au projet", "FORBIDDEN");
  }
  const task = findTask(projectId, taskId);
  if (!task) return fail("Tâche non trouvée", "TASK_NOT_FOUND");

  return ok("Tâche récupérée avec succès", { task: buildTaskDetail(task) });
}

/** POST /projects/:id/tasks */
export async function createTask(
  projectId: string,
  body: CreateTaskBody
): Promise<ApiResponse<{ task: TaskDetail }>> {
  await wait();
  const errors = validateTask(body, true);
  if (errors.length > 0) return invalid("Données de création de tâche invalides", errors);

  if (!hasProjectAccess(currentUserId, projectId)) {
    return fail("Accès refusé au projet", "FORBIDDEN");
  }
  if (!findProject(projectId)) return fail("Projet non trouvé", "PROJECT_NOT_FOUND");

  const { title, description, priority, dueDate, assigneeIds = [] } = body;
  if (!assigneeIds.every((userId) => hasProjectAccess(userId, projectId))) {
    return fail("Certains utilisateurs assignés ne sont pas membres du projet", "INVALID_ASSIGNEES");
  }

  const date = now();
  const task: Task = {
    id: newId(),
    title: title.trim(),
    description: description?.trim() || null,
    status: "TODO",
    priority: priority || "MEDIUM",
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    createdAt: date,
    updatedAt: date,
    projectId,
    creatorId: currentUserId,
  };
  tasks.push(task);
  setTaskAssignees(task.id, assigneeIds);

  return ok("Tâche créée avec succès", { task: buildTaskDetail(task) });
}

/** PUT /projects/:id/tasks/:taskId */
export async function updateTask(
  projectId: string,
  taskId: string,
  body: UpdateTaskBody
): Promise<ApiResponse<{ task: TaskDetail }>> {
  await wait();
  const errors = validateTask(body, false);
  if (errors.length > 0) return invalid("Données de mise à jour invalides", errors);

  if (!hasProjectAccess(currentUserId, projectId)) {
    return fail("Accès refusé au projet", "FORBIDDEN");
  }
  const task = findTask(projectId, taskId);
  if (!task) return fail("Tâche non trouvée", "TASK_NOT_FOUND");

  const { title, description, status, priority, dueDate, assigneeIds } = body;
  if (assigneeIds && !assigneeIds.every((userId) => hasProjectAccess(userId, projectId))) {
    return fail("Certains utilisateurs assignés ne sont pas membres du projet", "INVALID_ASSIGNEES");
  }

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim() || null;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate).toISOString() : null;
  task.updatedAt = now();
  if (assigneeIds !== undefined) setTaskAssignees(taskId, assigneeIds);

  return ok("Tâche mise à jour avec succès", { task: buildTaskDetail(task) });
}

/** DELETE /projects/:id/tasks/:taskId */
export async function deleteTask(projectId: string, taskId: string): Promise<ApiResponse> {
  await wait();
  if (!hasProjectAccess(currentUserId, projectId)) {
    return fail("Accès refusé au projet", "FORBIDDEN");
  }
  if (!findTask(projectId, taskId)) return fail("Tâche non trouvée", "TASK_NOT_FOUND");

  removeWhere(comments, (c) => c.taskId === taskId);
  removeWhere(taskAssignees, (a) => a.taskId === taskId);
  removeWhere(tasks, (t) => t.id === taskId);

  return ok("Tâche supprimée avec succès", undefined);
}

// ============================================================================
//  COMMENTAIRES  (/projects/:id/tasks/:taskId/comments/...)
// ============================================================================

/** GET /projects/:id/tasks/:taskId/comments — du plus ancien au plus récent */
export async function getComments(
  projectId: string,
  taskId: string
): Promise<ApiResponse<{ comments: CommentDetail[] }>> {
  await wait();
  if (!hasProjectAccess(currentUserId, projectId)) {
    return fail("Accès refusé au projet", "FORBIDDEN");
  }
  if (!findTask(projectId, taskId)) return fail("Tâche non trouvée", "TASK_NOT_FOUND");

  const result = comments
    .filter((c) => c.taskId === taskId)
    .sort((a, b) => compare(a.createdAt, b.createdAt))
    .map(buildCommentDetail);

  return ok("Commentaires récupérés avec succès", { comments: result });
}

/** GET /projects/:id/tasks/:taskId/comments/:commentId */
export async function getComment(
  projectId: string,
  taskId: string,
  commentId: string
): Promise<ApiResponse<{ comment: CommentDetail }>> {
  await wait();
  if (!hasProjectAccess(currentUserId, projectId)) {
    return fail("Accès refusé au projet", "FORBIDDEN");
  }
  const comment = findComment(projectId, taskId, commentId);
  if (!comment) return fail("Commentaire non trouvé", "COMMENT_NOT_FOUND");

  return ok("Commentaire récupéré avec succès", { comment: buildCommentDetail(comment) });
}

/** POST /projects/:id/tasks/:taskId/comments */
export async function createComment(
  projectId: string,
  taskId: string,
  body: CommentBody
): Promise<ApiResponse<{ comment: CommentDetail }>> {
  await wait();
  const errors = validateComment(body.content);
  if (errors.length > 0) return invalid("Données de création de commentaire invalides", errors);

  if (!hasProjectAccess(currentUserId, projectId)) {
    return fail("Accès refusé au projet", "FORBIDDEN");
  }
  if (!findTask(projectId, taskId)) return fail("Tâche non trouvée", "TASK_NOT_FOUND");

  const date = now();
  const comment: TaskComment = {
    id: newId(),
    content: body.content.trim(),
    createdAt: date,
    updatedAt: date,
    taskId,
    authorId: currentUserId,
  };
  comments.push(comment);

  return ok("Commentaire créé avec succès", { comment: buildCommentDetail(comment) });
}

/** PUT /projects/:id/tasks/:taskId/comments/:commentId — seulement par l'auteur */
export async function updateComment(
  projectId: string,
  taskId: string,
  commentId: string,
  body: CommentBody
): Promise<ApiResponse<{ comment: CommentDetail }>> {
  await wait();
  const errors = validateComment(body.content);
  if (errors.length > 0) return invalid("Données de mise à jour invalides", errors);

  if (!hasProjectAccess(currentUserId, projectId)) {
    return fail("Accès refusé au projet", "FORBIDDEN");
  }
  const comment = findComment(projectId, taskId, commentId);
  if (!comment) return fail("Commentaire non trouvé", "COMMENT_NOT_FOUND");
  if (comment.authorId !== currentUserId) {
    return fail("Vous ne pouvez modifier que vos propres commentaires", "FORBIDDEN");
  }

  comment.content = body.content.trim();
  comment.updatedAt = now();

  return ok("Commentaire mis à jour avec succès", { comment: buildCommentDetail(comment) });
}

/** DELETE /projects/:id/tasks/:taskId/comments/:commentId
 *  (comme dans le backend, tout membre du projet peut supprimer un commentaire) */
export async function deleteComment(
  projectId: string,
  taskId: string,
  commentId: string
): Promise<ApiResponse> {
  await wait();
  if (!hasProjectAccess(currentUserId, projectId)) {
    return fail("Accès refusé au projet", "FORBIDDEN");
  }
  if (!findComment(projectId, taskId, commentId)) {
    return fail("Commentaire non trouvé", "COMMENT_NOT_FOUND");
  }

  removeWhere(comments, (c) => c.id === commentId);
  return ok("Commentaire supprimé avec succès", undefined);
}

// ============================================================================
//  TABLEAU DE BORD  (/dashboard/...)
// ============================================================================

/** GET /dashboard/assigned-tasks — les tâches assignées à l'utilisateur connecté */
export async function getAssignedTasks(): Promise<ApiResponse<{ tasks: AssignedTask[] }>> {
  await wait();
  const result = tasks
    .filter((t) => isAssignedTo(t.id, currentUserId))
    .sort(dashboardOrder)
    .map((t) => {
      const project = findProject(t.projectId);
      return {
        ...buildDashboardTask(t),
        project: {
          id: t.projectId,
          name: project?.name ?? "",
          description: project?.description ?? null,
        },
      };
    });

  return ok("Tâches assignées récupérées", { tasks: result });
}

/** GET /dashboard/projects-with-tasks — les projets où l'utilisateur a des tâches assignées */
export async function getProjectsWithTasks(): Promise<
  ApiResponse<{ projects: DashboardProject[] }>
> {
  await wait();
  const myTasksOf = (projectId: string) =>
    tasks.filter((t) => t.projectId === projectId && isAssignedTo(t.id, currentUserId));

  const result = projects
    .filter((p) => myTasksOf(p.id).length > 0)
    .sort((a, b) => compare(a.name, b.name))
    .map((p) => ({
      ...p,
      owner: toUserSummary(p.ownerId),
      tasks: myTasksOf(p.id).sort(dashboardOrder).map(buildDashboardTask),
    }));

  return ok("Projets avec tâches récupérés", { projects: result });
}

/** GET /dashboard/stats */
export async function getDashboardStats(): Promise<ApiResponse<{ stats: DashboardStats }>> {
  await wait();
  const myTasks = tasks.filter((t) => isAssignedTo(t.id, currentUserId));
  const today = now();

  const byStatus: Partial<Record<TaskStatus, number>> = {};
  for (const task of myTasks) {
    byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
  }

  const stats: DashboardStats = {
    tasks: {
      total: myTasks.length,
      urgent: myTasks.filter((t) => t.priority === "URGENT" || t.priority === "HIGH").length,
      overdue: myTasks.filter((t) => t.dueDate !== null && t.dueDate < today && t.status !== "DONE")
        .length,
      byStatus,
    },
    projects: { total: new Set(myTasks.map((t) => t.projectId)).size },
  };

  return ok("Statistiques du tableau de bord récupérées", { stats });
}
