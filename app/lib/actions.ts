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
  searchUsers,
  TOKEN_COOKIE_NAME,
} from "@/app/lib/api";
import type { ApiError, UserSummary } from "@/app/lib/types";

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

  return { success: true, message: "Projet créé", errors: [], values };
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


export async function logout() {
  (await cookies()).delete("token")
  redirect("/connection")
}