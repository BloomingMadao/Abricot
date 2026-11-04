"use server";

/**
 * ============================================================================
 *  SERVER ACTIONS (les fonctions appelées par les formulaires)
 * ============================================================================
 *  "use server" en haut du fichier : toutes ces fonctions s'exécutent sur le
 *  SERVEUR, même quand elles sont appelées depuis un composant client.
 *  Elles font le lien entre un formulaire (qui envoie un FormData) et api.ts
 *  (qui attend un objet { email, password, ... }).
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
  updateTask,
  deleteTask,
  createComment,
  TOKEN_COOKIE_NAME,
} from "@/app/lib/api";
import type { ApiError, TaskStatus, UserSummary } from "@/app/lib/types";

/** Ce que l'action renvoie au formulaire quand il y a une erreur */
export type AuthFormState =
  | {
      message: string; // message général, ex : "Email ou mot de passe incorrect"
      errors: string[]; // détails des erreurs de validation (mot de passe trop faible...)
      values: Record<string, string>; // ce que l'utilisateur avait tapé, pour pré-remplir les champs
    }
  | undefined;

/** Range le token JWT dans un cookie : api.ts le relira à chaque appel au backend */
async function saveToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true, // le JavaScript du navigateur ne peut pas lire le cookie (sécurité)
    secure: process.env.NODE_ENV === "production", // HTTPS obligatoire en production
    sameSite: "lax",
    path: "/", // valable sur tout le site
    maxAge: 60 * 60 * 24 * 7, // 7 jours, comme le token du backend
  });
}

/** Transforme une erreur de l'API en état pour le formulaire */
function toFormState(response: ApiError, values: Record<string, string>): AuthFormState {
  return {
    message: response.message,
    errors: response.data?.errors.map((error) => error.message) ?? [],
    values,
  };
}

/** Formulaire de connexion */
export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  // 1. Lire les champs du formulaire (grâce à leur attribut "name")
  const email = String(formData.get("mail") ?? "");
  const password = String(formData.get("password") ?? "");

  

  // 2. Appeler l'API (mock ou vrai backend, selon .env.local)
  const response = await login({ email, password });

  // 3. Erreur : on renvoie le message au formulaire, qui l'affichera
  if (!response.success) {
    return toFormState(response, { mail: email });
  }

  // 4. Succès : on garde le token, puis on part sur le tableau de bord
  await saveToken(response.data.token);
  redirect("/dashboard");
}

/** Formulaire d'inscription */
export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  // 1. Lire les champs du formulaire
  const firstname = String(formData.get("firstname") ?? "").trim();
  const lastname = String(formData.get("lastname") ?? "").trim();
  const email = String(formData.get("mail") ?? "");
  const password = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  // 2. Les deux mots de passe doivent être identiques.
  //    On RENVOIE une erreur au formulaire (on ne fait pas "throw") :
  //    elle s'affiche dans le bloc role="alert", comme les erreurs de l'API.
  if (password !== confirmPassword) {
    return {
      message: "Les mots de passe ne correspondent pas",
      errors: [],
      values: { firstname, lastname, mail: email },
    };
  }

  // 3. Appeler l'API — le backend n'a qu'un champ "name" : on y met "Prénom Nom"
  const response = await register({
    email,
    password,
    name: `${firstname} ${lastname}`.trim(),
  });

  // 4. Erreur : on renvoie le message (et ce qui avait été tapé, sauf le mot de passe)
  if (!response.success) {
    return toFormState(response, { firstname, lastname, mail: email });
  }

  // 5. Succès : l'utilisateur est inscrit ET connecté (le backend renvoie un token)
  await saveToken(response.data.token);
  redirect("/dashboard");
}

/** Ce que l'action du profil renvoie au formulaire (succès OU erreur) */
export type ProfileFormState =
  | {
      success: boolean; // true = enregistré (alerte verte), false = erreur (alerte rouge)
      message: string;
      errors: string[];
      values: Record<string, string>; // ce que l'utilisateur a tapé, pour pré-remplir les champs
    }
  | undefined;

/** Liste des messages d'erreur détaillés d'une réponse de l'API */
function errorMessages(response: ApiError): string[] {
  return response.data?.errors.map((error) => error.message) ?? [];
}

/** Formulaire "Mon compte" */
export async function updateProfileAction(
  _previousState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  // 1. Lire les champs du formulaire
  const firstname = String(formData.get("firstname") ?? "").trim();
  const lastname = String(formData.get("lastname") ?? "").trim();
  const email = String(formData.get("mail") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const values = { firstname, lastname, mail: email };

  // 2. Pour changer de mot de passe, l'API exige aussi le mot de passe actuel.
  //    On vérifie AVANT d'enregistrer quoi que ce soit.
  if (newPassword && !currentPassword) {
    return {
      success: false,
      message: "Indiquez votre mot de passe actuel pour en choisir un nouveau",
      errors: [],
      values,
    };
  }

  // 3. Mot de passe EN PREMIER, seulement si un nouveau a été tapé (vide = on n'y touche pas).
  //    Si le mot de passe actuel est faux, on s'arrête là : rien n'est enregistré.
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

  // 4. Nom et email — le backend n'a qu'un champ "name" : on y met "Prénom Nom"
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

  // 5. Le nom a pu changer : on demande à Next.js de recalculer les pages,
  //    pour que le Header (les initiales) et cette page affichent les nouvelles infos
  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Vos informations ont été mises à jour",
    errors: [],
    values,
  };
}

/** Ce que l'action de création de projet renvoie au formulaire (même forme que ProfileFormState) */
export type ProjectFormState =
  | {
      success: boolean;
      message: string;
      errors: string[];
      values: Record<string, string>; // ce qui a été tapé, pour pré-remplir les champs
    }
  | undefined;

/** Formulaire "Créer un projet" (dans la modale) */
export async function createProjectAction(
  _previousState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  // 1. Lire les champs du formulaire.
  //    getAll : il y a une case cochée "contributors" PAR personne choisie
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const contributors = formData.getAll("contributors").map(String);
  const values = { name, description };

  // 2. La maquette rend la description obligatoire (l'API, elle, l'accepte vide).
  //    On le vérifie aussi ici : le "required" du navigateur peut être contourné.
  if (!description) {
    return {
      success: false,
      message: "La description est obligatoire",
      errors: [],
      values,
    };
  }

  // 3. Appeler l'API
  const response = await createProject({ name, description, contributors });

  // 3. Erreur : on renvoie le message, la modale reste ouverte
  if (!response.success) {
    return {
      success: false,
      message: response.message,
      errors: errorMessages(response),
      values,
    };
  }

  // 4. Succès : les pages qui affichent des projets devront se recalculer
  revalidatePath("/", "layout");

  // 5. Puis on part sur la page du projet qui vient d'être créé.
  //    L'API renvoie le projet créé, avec son id : c'est lui qui donne l'adresse.
  //    ?created=1 : dit à la page du projet d'afficher "Le projet ... a été créé"
  //    (Comme pour loginAction : redirect() arrête la fonction, rien n'est renvoyé au formulaire)
  redirect(`/projects/${response.data.project.id}?created=1`);
}

/** Formulaire "Modifier le projet" (modale ouverte par le lien "Modifier" de la page du projet) */
export async function updateProjectAction(
  _previousState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  // 1. Lire les champs. projectId : champ caché (QUEL projet modifier).
  //    getAll : une case cochée "contributors" PAR personne gardée ou ajoutée (son email)
  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const contributors = formData.getAll("contributors").map(String);
  const values = { name, description };

  // 2. Description obligatoire, comme à la création
  if (!description) {
    return {
      success: false,
      message: "La description est obligatoire",
      errors: [],
      values,
    };
  }

  // 3. Le nom et la description
  const response = await updateProject(projectId, { name, description });
  if (!response.success) {
    return {
      success: false,
      message: response.message,
      errors: errorMessages(response),
      values,
    };
  }

  // 4. Les contributeurs. L'API ne sait pas "remplacer la liste" d'un coup :
  //    on compare avec les membres actuels (renvoyés par updateProject),
  //    puis on AJOUTE les nouveaux et on RETIRE ceux qui ont été décochés.
  const currentMembers = response.data.project.members.map((member) => member.user);
  const toAdd = contributors.filter(
    (email) => !currentMembers.some((user) => user.email === email)
  );
  const toRemove = currentMembers.filter((user) => !contributors.includes(user.email));

  // Tous les appels partent EN MÊME TEMPS (Promise.all)
  const results = await Promise.all([
    ...toAdd.map((email) => addContributor(projectId, { email })),
    ...toRemove.map((user) => removeContributor(projectId, user.id)),
  ]);

  // 5. La page du projet (et la liste des projets) se recalculent
  revalidatePath("/", "layout");

  // 6. Un ajout ou un retrait a échoué : on le dit (le nom et la description, eux, sont enregistrés)
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

/** Recherche d'utilisateurs pour la liste "Contributeurs" (appelée pendant la frappe).
 *  Ce n'est pas un formulaire : la fonction reçoit directement le texte tapé. */
export async function searchUsersAction(
  query: string
): Promise<{ users: UserSummary[]; error?: string }> {
  const response = await searchUsers(query);
  if (!response.success) return { users: [], error: response.message };
  return { users: response.data.users };
}

/** Les membres d'un projet, propriétaire compris : les seules personnes qu'on peut
 *  assigner à une tâche (l'API refuse les autres). Appelée à l'ouverture de la modale "Modifier". */
export async function getProjectMembersAction(
  projectId: string
): Promise<{ members: UserSummary[]; error?: string }> {
  const response = await getProject(projectId);
  if (!response.success) return { members: [], error: response.message };

  const { owner, members } = response.data.project;
  // ⚠️ L'API ne met pas le propriétaire dans members : on l'ajoute en premier
  return { members: [owner, ...members.map((member) => member.user)] };
}

/** Même forme que pour un projet : success, message, errors, values */
export type TaskFormState = ProjectFormState;

/** Formulaire "Modifier" une tâche (dans la modale du tableau de bord) */
export async function updateTaskAction(
  _previousState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  // 1. Quelle tâche ? (champs cachés du formulaire)
  const projectId = String(formData.get("projectId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");

  // 2. Les champs. getAll : une case cochée "assigneeIds" PAR personne assignée
  //    (aucune case cochée = tableau vide = plus personne d'assigné)
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? ""); // "" = échéance effacée
  const status = String(formData.get("status") ?? "");
  const assigneeIds = formData.getAll("assigneeIds").map(String);
  const values = { title, description, dueDate, status };

  // 3. Appeler l'API (elle vérifie elle-même le titre, la date, le statut...)
  const response = await updateTask(projectId, taskId, {
    title,
    description,
    dueDate,
    // Aucun statut choisi (tâche "Annulée", absente des choix) : on n'envoie rien, il ne change pas
    status: status ? (status as TaskStatus) : undefined,
    assigneeIds,
  });

  // 4. Erreur : on renvoie le message, la modale reste ouverte
  if (!response.success) {
    return {
      success: false,
      message: response.message,
      errors: errorMessages(response),
      values,
    };
  }

  // 5. Succès : le tableau de bord se recalcule avec la tâche modifiée
  revalidatePath("/", "layout");

  return { success: true, message: "Tâche modifiée", errors: [], values };
}

/** Supprimer une tâche (bouton "Supprimer" du menu "…", après confirmation).
 *  Ce n'est pas un formulaire : la fonction reçoit directement le projet et la tâche. */
export async function deleteTaskAction(
  projectId: string,
  taskId: string
): Promise<{ error?: string }> {
  const response = await deleteTask(projectId, taskId);
  if (!response.success) return { error: response.message };

  // La page du projet (et le tableau de bord) se recalculent sans la tâche
  revalidatePath("/", "layout");
  return {};
}

/** Même forme que pour un projet : success, message, errors, values */
export type CommentFormState = ProjectFormState;

/** Formulaire "Ajouter un commentaire" (sous les commentaires d'une tâche) */
export async function createCommentAction(
  _previousState: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  // 1. Sur quelle tâche ? (champs cachés du formulaire) + le texte du commentaire
  const projectId = String(formData.get("projectId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  // 2. Appeler l'API (elle vérifie elle-même le texte : vide, trop long...)
  const response = await createComment(projectId, taskId, { content });

  // 3. Erreur : on renvoie le message, et le texte tapé pour ne pas le perdre
  if (!response.success) {
    return {
      success: false,
      message: response.message,
      errors: errorMessages(response),
      values: { content },
    };
  }

  // 4. Succès : la page se recalcule avec le nouveau commentaire
  revalidatePath("/", "layout");
  return { success: true, message: "Commentaire ajouté", errors: [], values: { content: "" } };
}

export async function logout() {
  (await cookies()).delete("token")
  redirect("/connection")
}