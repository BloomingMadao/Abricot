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
  addContributor,
  removeContributor,
  searchUsers,
  getProject,
  createTask,
  updateTask,
  deleteTask,
  createComment,
  TOKEN_COOKIE_NAME,
} from "@/app/lib/api";
import type { ApiError, TaskStatus, UserSummary } from "@/app/lib/types";

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
  //    (As with loginAction: redirect() stops the function, nothing is returned to the form)
  redirect(`/projects/${response.data.project.id}?created=1`);
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

  // 3. Call the API (it checks the title, date, status... itself)
  const response = await updateTask(projectId, taskId, {
    title,
    description,
    dueDate,
    // No status chosen ("Annulée" task, not among the choices): send nothing, it doesn't change
    status: status ? (status as TaskStatus) : undefined,
    assigneeIds,
  });

  // 4. Error: send back the message, the modal stays open
  if (!response.success) {
    return {
      success: false,
      message: response.message,
      errors: errorMessages(response),
      values,
    };
  }

  // 5. Success: the dashboard re-renders with the updated task
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

/** A task suggested in the AI modal: nothing is saved yet, the user can still
 *  edit or delete it before clicking "+ Ajouter les tâches" */
export type SuggestedTask = { title: string; description: string };

/** What the AI chat returns: the suggested tasks, or an error */
export type AITaskFormState =
  | {
      success: boolean;
      message: string;
      tasks: SuggestedTask[];
      values: { prompt: string }; // the typed message, to put it back after an error
    }
  | undefined;

/** Maximum number of tasks suggested at once */
const MAX_SUGGESTED_TASKS = 10;

/** AI chat "Décrivez les tâches que vous souhaitez ajouter..." (IA button of a project page).
 *
 *  STEP 1, without AI: we look for a number in the message ("3", "crée 5 tâches"...)
 *  and return that many tasks with default values.
 *
 *  Later, THIS is where the AI will be called (openai-node): the call must stay on the
 *  server, so that the API key (TOKEN_IA in .env.local) never reaches the browser.
 *  The modal won't need any change: it only expects { title, description } tasks. */
export async function suggestTasksAction(
  _previousState: AITaskFormState,
  formData: FormData
): Promise<AITaskFormState> {
  const prompt = String(formData.get("prompt") ?? "").trim();
  const values = { prompt };

  // The first number of the message (\d+ = one or more digits)
  const match = prompt.match(/\d+/);
  const count = match ? Number(match[0]) : 0;

  if (!match) {
    return {
      success: false,
      message: "Indiquez le nombre de tâches à créer, par exemple : 3",
      tasks: [],
      values,
    };
  }
  if (count < 1 || count > MAX_SUGGESTED_TASKS) {
    return {
      success: false,
      message: `Choisissez entre 1 et ${MAX_SUGGESTED_TASKS} tâches à la fois`,
      tasks: [],
      values,
    };
  }

  // Array.from({ length: 3 }, ...): an array of 3 elements, built by the function
  const tasks = Array.from({ length: count }, () => ({
    title: "Nom de la tâche",
    description: "Description de la tâche",
  }));

  return {
    success: true,
    message: `${count} tâche${count > 1 ? "s" : ""} proposée${count > 1 ? "s" : ""}`,
    tasks,
    // Success: the chat field is emptied, ready for the next message
    values: { prompt: "" },
  };
}

/** "+ Ajouter les tâches" button of the AI modal: creates the suggested tasks in the project.
 *  It's not a form: the function directly receives the project and the tasks.
 *  failedIndexes: the position of the tasks that could NOT be created,
 *  so the modal only keeps those (the others must not be created twice). */
export async function createTasksAction(
  projectId: string,
  tasks: SuggestedTask[]
): Promise<{ error?: string; errors?: string[]; failedIndexes?: number[] }> {
  if (tasks.length === 0) return { error: "Aucune tâche à ajouter" };

  // All the creations start AT THE SAME TIME (Promise.all).
  // The API checks each title itself (2 to 200 characters).
  const results = await Promise.all(
    tasks.map((task) =>
      createTask(projectId, { title: task.title.trim(), description: task.description.trim() })
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
 *  It's not a form: the function receives the project and the task directly. */
export async function deleteTaskAction(
  projectId: string,
  taskId: string
): Promise<{ error?: string }> {
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

export async function logout() {
  (await cookies()).delete("token")
  redirect("/connection")
}