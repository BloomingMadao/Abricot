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
import { login, register, TOKEN_COOKIE_NAME } from "@/app/lib/api";
import type { ApiError } from "@/app/lib/types";

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


export async function logout() {
  (await cookies()).delete("token")
  redirect("/connection")
}