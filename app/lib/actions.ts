"use server";

/**
 * ============================================================================
 *  SERVER ACTIONS (the functions called by the forms)
 * ============================================================================
 *  "use server" at the top of the file: all these functions run on the
 *  SERVER, even when they are called from a client component.
 *  They bridge a form (which sends FormData) and api.ts
 *  (which expects an object { email, password, ... }).
 * ============================================================================
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  login,
  register,
  updateProfile,
  updatePassword,
  createProject,
  updateProject,
  deleteProject,
  addContributor,
  removeContributor,
  searchUsers,
  getProject,
  getProfile,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  createComment,
  TOKEN_COOKIE_NAME,
} from "@/app/lib/api";
import type { ApiError, TaskStatus, UserSummary } from "@/app/lib/types";
import { editTaskError } from "@/app/lib/utils";
import { defaultTasks, isAIEnabled, suggestTasks, type SuggestedTask } from "@/app/lib/ai";

/** What the action returns to the form when there's an error */
export type AuthFormState =
  | {
      message: string; // general message, e.g. "Email ou mot de passe incorrect"
      errors: string[]; // details of validation errors (password too weak...)
      values: Record<string, string>; // what the user had typed, to pre-fill the fields
    }
  | undefined;

/** Stores the JWT token in a cookie: api.ts will read it back on every backend call */
async function saveToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true, // the browser's JavaScript cannot read the cookie (security)
    secure: process.env.NODE_ENV === "production", // HTTPS required in production
    sameSite: "lax",
    path: "/", // valid across the whole site
    maxAge: 60 * 60 * 24 * 7, // 7 days, like the backend token
  });
}

/** Turns an API error into a state for the form */
function toFormState(response: ApiError, values: Record<string, string>): AuthFormState {
  return {
    message: response.message,
    errors: response.data?.errors.map((error) => error.message) ?? [],
    values,
  };
}

/** Login form */
export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  // 1. Read the form fields (thanks to their "name" attribute)
  const email = String(formData.get("mail") ?? "");
  const password = String(formData.get("password") ?? "");

  

  // 2. Call the API (mock or real backend, depending on .env.local)
  const response = await login({ email, password });

  // 3. Error: send the message back to the form, which will display it
  if (!response.success) {
    return toFormState(response, { mail: email });
  }

  // 4. Success: keep the token, then go to the dashboard
  await saveToken(response.data.token);
  redirect("/dashboard");
}

/** Sign-up form */
export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  // 1. Read the form fields
  const firstname = String(formData.get("firstname") ?? "").trim();
  const lastname = String(formData.get("lastname") ?? "").trim();
  const email = String(formData.get("mail") ?? "");
  const password = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  // 2. Both passwords must match.
  //    We RETURN an error to the form (we don't "throw"):
  //    it shows up in the role="alert" block, like the API errors.
  if (password !== confirmPassword) {
    return {
      message: "Les mots de passe ne correspondent pas",
      errors: [],
      values: { firstname, lastname, mail: email },
    };
  }

  // 3. Call the API — the backend only has a "name" field: we put "FirstName LastName" in it
  const response = await register({
    email,
    password,
    name: `${firstname} ${lastname}`.trim(),
  });

  // 4. Error: send back the message (and what had been typed, except the password)
  if (!response.success) {
    return toFormState(response, { firstname, lastname, mail: email });
  }

  // 5. Success: the user is signed up AND logged in (the backend returns a token)
  await saveToken(response.data.token);
  redirect("/dashboard");
}

/** What the profile action returns to the form (success OR error) */
export type ProfileFormState =
  | {
      success: boolean; // true = saved (green alert), false = error (red alert)
      message: string;
      errors: string[];
      values: Record<string, string>; // what the user typed, to pre-fill the fields
    }
  | undefined;

/** List of detailed error messages from an API response */
function errorMessages(response: ApiError): string[] {
  return response.data?.errors.map((error) => error.message) ?? [];
}

/** "Mon compte" form */
export async function updateProfileAction(
  _previousState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  // 1. Read the form fields
  const firstname = String(formData.get("firstname") ?? "").trim();
  const lastname = String(formData.get("lastname") ?? "").trim();
  const email = String(formData.get("mail") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const values = { firstname, lastname, mail: email };

  // 2. To change the password, the API also requires the current password.
  //    We check BEFORE saving anything.
  if (newPassword && !currentPassword) {
    return {
      success: false,
      message: "Indiquez votre mot de passe actuel pour en choisir un nouveau",
      errors: [],
      values,
    };
  }

  // 3. Password FIRST, only if a new one was typed (empty = left untouched).
  //    If the current password is wrong, we stop there: nothing is saved.
  if (newPassword) {
    const passwordResponse = await updatePassword({ currentPassword, newPassword });
    if (!passwordResponse.success) {
      return {
        success: false,
        message: passwordResponse.message,
        errors: errorMessages(passwordResponse),
        values,
      };
    }
  }

  // 4. Name and email — the backend only has a "name" field: we put "FirstName LastName" in it
  const profileResponse = await updateProfile({
    name: `${firstname} ${lastname}`.trim(),
    email,
  });
  if (!profileResponse.success) {
    return {
      success: false,
      message: profileResponse.message,
      errors: errorMessages(profileResponse),
      values,
    };
  }

  // 5. The name may have changed: we ask Next.js to re-render the pages,
  //    so that the Header (the initials) and this page show the new info
  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Vos informations ont été mises à jour",
    errors: [],
    values,
  };
}

/** What the project creation action returns to the form (same shape as ProfileFormState) */
export type ProjectFormState =
  | {
      success: boolean;
      message: string;
      errors: string[];
      values: Record<string, string>; // what was typed, to pre-fill the fields
    }
  | undefined;

/** "Créer un projet" form (in the modal) */
export async function createProjectAction(
  _previousState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  // 1. Read the form fields.
  //    getAll: there's one checked "contributors" box PER selected person
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const contributors = formData.getAll("contributors").map(String);
  // from: hidden field, the page the modal was opened from ("dashboard" or "projects")
  const from = String(formData.get("from") ?? "");
  const values = { name, description };

  // 2. The mockup makes the description required (the API, however, accepts it empty).
  //    We also check it here: the browser's "required" can be bypassed.
  if (!description) {
    return {
      success: false,
      message: "La description est obligatoire",
      errors: [],
      values,
    };
  }

  // 3. Call the API
  const response = await createProject({ name, description, contributors });

  // 3. Error: send back the message, the modal stays open
  if (!response.success) {
    return {
      success: false,
      message: response.message,
      errors: errorMessages(response),
      values,
    };
  }

  // 4. Success: the pages that display projects will need to re-render
  revalidatePath("/", "layout");

  // 5. Then go to the page of the project that was just created.
  //    The API returns the created project, with its id: that's what gives the URL.
  //    ?created=1: tells the project page to show "Le projet ... a été créé"
  //    &from=dashboard: created from the dashboard, its "back" button returns there
  //    (without it, the "back" button returns to the projects list)
  //    (As with loginAction: redirect() stops the function, nothing is returned to the form)
  const fromParam = from === "dashboard" ? "&from=dashboard" : "";
  redirect(`/projects/${response.data.project.id}?created=1${fromParam}`);
}

/** "Modifier le projet" form (modal opened by the "Modifier" link on the project page) */
export async function updateProjectAction(
  _previousState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  // 1. Read the fields. projectId: hidden field (WHICH project to edit).
  //    getAll: one checked "contributors" box PER person kept or added (their email)
  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const contributors = formData.getAll("contributors").map(String);
  const values = { name, description };

  // 2. Description required, as on creation
  if (!description) {
    return {
      success: false,
      message: "La description est obligatoire",
      errors: [],
      values,
    };
  }

  // 3. The name and the description
  const response = await updateProject(projectId, { name, description });
  if (!response.success) {
    return {
      success: false,
      message: response.message,
      errors: errorMessages(response),
      values,
    };
  }

  // 4. The contributors. The API can't "replace the list" in one go:
  //    we compare with the current members (returned by updateProject),
  //    then we ADD the new ones and REMOVE those that were unchecked.
  const currentMembers = response.data.project.members.map((member) => member.user);
  const toAdd = contributors.filter(
    (email) => !currentMembers.some((user) => user.email === email)
  );
  const toRemove = currentMembers.filter((user) => !contributors.includes(user.email));

  // All the calls are sent AT THE SAME TIME (Promise.all)
  const results = await Promise.all([
    ...toAdd.map((email) => addContributor(projectId, { email })),
    ...toRemove.map((user) => removeContributor(projectId, user.id)),
  ]);

  // 5. The project page (and the project list) re-render
  revalidatePath("/", "layout");

  // 6. An addition or removal failed: we say so (the name and description, however, are saved)
  const failed = results.filter((result) => !result.success);
  if (failed.length > 0) {
    return {
      success: false,
      message: "Le projet a été modifié, mais pas tous les contributeurs",
      errors: failed.map((result) => result.message),
      values,
    };
  }

  return { success: true, message: "Projet modifié", errors: [], values };
}

/** Deletes a project ("Supprimer" link of the project page, after confirmation).
 *  Only the owner can do it (the API refuses everyone else, even the admins).
 *  It's not a form: the function receives the project directly. */
export async function deleteProjectAction(projectId: string): Promise<{ error?: string }> {
  // 1. The project name, for the confirmation message on the projects page
  //    (read BEFORE deleting: afterwards the project no longer exists)
  const project = await getProject(projectId);
  const name = project.success ? project.data.project.name : "";

  // 2. Delete it (its tasks, comments and members go with it)
  const response = await deleteProject(projectId);
  if (!response.success) return { error: response.message };

  // 3. The projects list and the dashboard are recomputed without it
  revalidatePath("/", "layout");

  // 4. Its page no longer exists: we go to the projects list.
  //    ?deleted=...: tells the page to show "Le projet ... a été supprimé"
  //    (encodeURIComponent: the name can contain spaces, accents, "&"...)
  redirect(`/projects?deleted=${encodeURIComponent(name)}`);
}

/** Searches users for the "Contributeurs" list (called while typing).
 *  It's not a form: the function receives the typed text directly. */
export async function searchUsersAction(
  query: string
): Promise<{ users: UserSummary[]; error?: string }> {
  const response = await searchUsers(query);
  if (!response.success) return { users: [], error: response.message };
  return { users: response.data.users };
}

/** A project's members, owner included: the only people who can be
 *  assigned to a task (the API rejects others). Called when the "Modifier" modal opens. */
export async function getProjectMembersAction(
  projectId: string
): Promise<{ members: UserSummary[]; error?: string }> {
  const response = await getProject(projectId);
  if (!response.success) return { members: [], error: response.message };

  const { owner, members } = response.data.project;
  // ⚠️ The API does not include the owner in members: we add them first
  return { members: [owner, ...members.map((member) => member.user)] };
}

/** Same shape as for a project: success, message, errors, values */
export type TaskFormState = ProjectFormState;

/** Can the logged-in user edit this task? (Abricot's rule, see editTaskError in utils.ts).
 *  Checked HERE, on the server: showing a red alert in the modal isn't enough,
 *  a request can be sent without the form.
 *  The project (its owner), the task (its assignees) and the logged-in user, all at the same time.
 *  Not exported: only updateTaskAction uses it. */
async function getTaskRights(
  projectId: string,
  taskId: string
): Promise<{ error: string } | { editError: string | null }> {
  const [projectResponse, taskResponse, profile] = await Promise.all([
    getProject(projectId),
    getTask(projectId, taskId),
    getProfile(),
  ]);
  if (!projectResponse.success) return { error: projectResponse.message };
  if (!taskResponse.success) return { error: taskResponse.message };
  if (!profile.success) return { error: "Impossible de récupérer votre profil" };

  const userId = profile.data.user.id;
  const isOwner = projectResponse.data.project.owner.id === userId;
  const assigneeIds = taskResponse.data.task.assignees.map(({ user }) => user.id);
  // null = allowed, otherwise the reason (the same message as in the "Modifier" modal)
  return { editError: editTaskError(assigneeIds, userId, isOwner) };
}

/** Task "Modifier" form (in the dashboard modal) */
export async function updateTaskAction(
  _previousState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  // 1. Which task? (hidden form fields)
  const projectId = String(formData.get("projectId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");

  // 2. The fields. getAll: one checked "assigneeIds" box PER assigned person
  //    (no box checked = empty array = nobody assigned anymore)
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? ""); // "" = due date cleared
  const status = String(formData.get("status") ?? "");
  const assigneeIds = formData.getAll("assigneeIds").map(String);
  const values = { title, description, dueDate, status };

  // 3. Only the project owner or a person assigned to the task can edit it
  const rights = await getTaskRights(projectId, taskId);
  if ("error" in rights) {
    return { success: false, message: rights.error, errors: [], values };
  }
  if (rights.editError) {
    return { success: false, message: rights.editError, errors: [], values };
  }

  // 4. Call the API (it checks the title, date, status... itself)
  const response = await updateTask(projectId, taskId, {
    title,
    description,
    dueDate,
    // No status chosen: send nothing, the status doesn't change
    status: status ? (status as TaskStatus) : undefined,
    assigneeIds,
  });

  // 5. Error: send back the message, the modal stays open
  if (!response.success) {
    return {
      success: false,
      message: response.message,
      errors: errorMessages(response),
      values,
    };
  }

  // 6. Success: the dashboard re-renders with the updated task
  revalidatePath("/", "layout");

  return { success: true, message: "Tâche modifiée", errors: [], values };
}

/** "Créer une tâche" form (modal of the "Créer une tâche" button on a project page) */
export async function createTaskAction(
  _previousState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  // 1. Read the fields. projectId: hidden field (in WHICH project to create the task).
  //    getAll: one checked "assigneeIds" box PER assigned person (their id)
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "");
  const status = String(formData.get("status") ?? "");
  const assigneeIds = formData.getAll("assigneeIds").map(String);
  const values = { title, description, dueDate, status };

  // 2. Description and due date required in the mockup (the API, however, accepts them empty).
  //    We also check it here: the browser's "required" can be bypassed.
  if (!description || !dueDate) {
    return {
      success: false,
      message: "La description et l'échéance sont obligatoires",
      errors: [],
      values,
    };
  }

  // 3. Create the task
  const response = await createTask(projectId, { title, description, dueDate, assigneeIds });
  if (!response.success) {
    return {
      success: false,
      message: response.message,
      errors: errorMessages(response),
      values,
    };
  }

  // 4. The status: the API ALWAYS creates a "À faire" (to do) task (no status on creation).
  //    If another status was chosen, we change it right after, using the new task's id.
  if (status && status !== "TODO") {
    const statusResponse = await updateTask(projectId, response.data.task.id, {
      status: status as TaskStatus,
    });
    if (!statusResponse.success) {
      revalidatePath("/", "layout");
      return {
        success: false,
        message: "La tâche a été créée, mais pas son statut",
        errors: errorMessages(statusResponse),
        values,
      };
    }
  }

  // 5. Success: the project page re-renders with the new task
  revalidatePath("/", "layout");
  return { success: true, message: "Tâche créée", errors: [], values };
}

// The type of a suggested task lives in ai.ts; we re-export it so the components
// can keep importing it from here ("export type" is erased at build time)
export type { SuggestedTask };

/** What the AI chat returns: the suggested tasks, or an error */
export type AITaskFormState =
  | {
      success: boolean;
      message: string;
      tasks: SuggestedTask[];
      values: { prompt: string }; // the typed message, to put it back after an error
    }
  | undefined;

/** Maximum length of the message sent to the AI (also limited by the field's maxLength) */
const MAX_PROMPT_LENGTH = 1000;

/** AI chat "Décrivez les tâches que vous souhaitez ajouter..." (IA button of a project page).
 *  - AI mode ON: the AI (see ai.ts) reads the message and chooses the right number of tasks:
 *    the one asked ("3 tâches pour..."), otherwise the one that fits the request.
 *  - AI mode OFF (USE_IA=false or no TOKEN_IA): the message gives the number of tasks,
 *    created with default values ("Nom de la tâche", "Description de la tâche").
 *  The call stays on the server: the API key (TOKEN_IA) never reaches the browser. */
export async function suggestTasksAction(
  _previousState: AITaskFormState,
  formData: FormData
): Promise<AITaskFormState> {
  // 1. Read the fields. projectId: hidden field (the project the tasks are for)
  const projectId = String(formData.get("projectId") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const values = { prompt };

  // 2. The message is checked here too: the browser's "required" and "maxLength" can be bypassed
  if (!prompt) {
    return { success: false, message: "Décrivez les tâches que vous souhaitez ajouter", tasks: [], values };
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return {
      success: false,
      message: `Votre demande est trop longue (${MAX_PROMPT_LENGTH} caractères maximum)`,
      tasks: [],
      values,
    };
  }

  // 3. AI mode OFF: the number of tasks written in the message
  if (!isAIEnabled()) {
    const result = defaultTasks(prompt);
    if (!result.success) return { success: false, message: result.message, tasks: [], values };
    return successState(result.tasks);
  }

  // 4. The project gives the AI its context (name, description, existing tasks).
  //    It also checks that the user is a member: the API refuses the others.
  const projectResponse = await getProject(projectId);
  if (!projectResponse.success) {
    return { success: false, message: projectResponse.message, tasks: [], values };
  }
  const { project } = projectResponse.data;

  // 5. Ask the AI
  const result = await suggestTasks(prompt, {
    name: project.name,
    description: project.description,
    taskTitles: project.tasks.map((task) => task.title),
  });
  if (!result.success) {
    return { success: false, message: result.message, tasks: [], values };
  }
  return successState(result.tasks);
}

/** The state returned when tasks are suggested (with or without AI) */
function successState(tasks: SuggestedTask[]): AITaskFormState {
  const count = tasks.length;
  return {
    success: true,
    // Read by screen readers: "3 tâches proposées"
    message: `${count} tâche${count > 1 ? "s" : ""} proposée${count > 1 ? "s" : ""}`,
    tasks,
    // Success: the chat field is emptied, ready for the next message
    values: { prompt: "" },
  };
}

/** "+ Ajouter les tâches" button of the AI modal: creates the suggested tasks in the project,
 *  assigned to the logged-in user.
 *  It's not a form: the function directly receives the project and the tasks.
 *  failedIndexes: the position of the tasks that could NOT be created,
 *  so the modal only keeps those (the others must not be created twice). */
export async function createTasksAction(
  projectId: string,
  tasks: SuggestedTask[]
): Promise<{ error?: string; errors?: string[]; failedIndexes?: number[] }> {
  if (tasks.length === 0) return { error: "Aucune tâche à ajouter" };

  // The logged-in user, read HERE on the server (from the cookie): the browser
  // doesn't choose who is assigned, it can't put someone else's id
  const profile = await getProfile();
  if (!profile.success) return { error: "Impossible de récupérer votre profil" };
  const assigneeIds = [profile.data.user.id];

  // All the creations start AT THE SAME TIME (Promise.all).
  // The API checks each title itself (2 to 200 characters).
  const results = await Promise.all(
    tasks.map((task) =>
      createTask(projectId, {
        title: task.title.trim(),
        description: task.description.trim(),
        assigneeIds,
      })
    )
  );

  // The project page is recomputed with the new tasks
  revalidatePath("/", "layout");

  const failedIndexes = results.flatMap((result, index) => (result.success ? [] : [index]));
  if (failedIndexes.length > 0) {
    // The reasons given by the API (detailed errors, otherwise the general message),
    // without repeating the same reason for each task (new Set removes the duplicates)
    const reasons = results.flatMap((result) => {
      if (result.success) return [];
      const details = errorMessages(result);
      return details.length > 0 ? details : [result.message];
    });
    return {
      error:
        failedIndexes.length === tasks.length
          ? "Les tâches n'ont pas pu être créées"
          : `${failedIndexes.length} tâche(s) sur ${tasks.length} n'ont pas pu être créées`,
      errors: [...new Set(reasons)],
      failedIndexes,
    };
  }
  return {};
}

/** Deletes a task ("Supprimer" button in the "…" menu, after confirmation).
 *  Any project member can do it, as in the specifications
 *  (the API refuses the people who are not members of the project).
 *  It's not a form: the function receives the project and the task directly. */
export async function deleteTaskAction(
  projectId: string,
  taskId: string
): Promise<{ error?: string }> {
  // Delete it (its comments go with it)
  const response = await deleteTask(projectId, taskId);
  if (!response.success) return { error: response.message };

  // The project page (and the dashboard) re-render without the task
  revalidatePath("/", "layout");
  return {};
}

/** Same shape as for a project: success, message, errors, values */
export type CommentFormState = ProjectFormState;

/** "Ajouter un commentaire" form (below a task's comments) */
export async function createCommentAction(
  _previousState: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  // 1. On which task? (hidden form fields) + the comment text
  const projectId = String(formData.get("projectId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  // 2. Call the API (it checks the text itself: empty, too long...)
  const response = await createComment(projectId, taskId, { content });

  // 3. Error: send back the message, and the typed text so it isn't lost
  if (!response.success) {
    return {
      success: false,
      message: response.message,
      errors: errorMessages(response),
      values: { content },
    };
  }

  // 4. Success: the page re-renders with the new comment
  revalidatePath("/", "layout");
  return { success: true, message: "Commentaire ajouté", errors: [], values: { content: "" } };
}

/** "Déconnexion" (user menu): deletes the cookie with the token, then back to the login page */
export async function logout() {
  (await cookies()).delete(TOKEN_COOKIE_NAME)
  redirect("/connection")
}