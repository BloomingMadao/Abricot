"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type ProfileFormState } from "@/app/lib/actions";
import Input from "@/app/components/Input/Input";
import Button from "@/app/components/Button/Button";
import Alert from "@/app/components/Alert/Alert";

type ProfileFormProps = {
  // Les infos actuelles, récupérées par la page (composant serveur)
  firstname: string;
  lastname: string;
  email: string;
};

export default function ProfileForm({ firstname, lastname, email }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, undefined);

  // Même principe que dans AuthForm : l'alerte fermée avec la croix
  const [dismissedState, setDismissedState] = useState<ProfileFormState>(undefined);

  return (
    <form action={formAction} className="mt-10">
      {/* Alerte verte si c'est enregistré, rouge s'il y a une erreur */}
      {state && state !== dismissedState && (
        <Alert
          message={state.message}
          errors={state.errors}
          variant={state.success ? "success" : "error"}
          onClose={() => setDismissedState(state)}
        />
      )}

      {/* defaultValue : ce que l'utilisateur vient de taper (après un envoi),
          sinon ses infos actuelles */}
      <Input
        label="Nom"
        id="lastname"
        type="text"
        autoComplete="family-name"
        required
        defaultValue={state?.values.lastname ?? lastname}
        className="w-full"
      />
      <Input
        label="Prénom"
        id="firstname"
        type="text"
        autoComplete="given-name"
        required
        defaultValue={state?.values.firstname ?? firstname}
        className="w-full"
      />
      <Input
        label="Email"
        id="mail"
        type="email"
        autoComplete="email"
        required
        defaultValue={state?.values.mail ?? email}
        className="w-full"
      />

      {/* Les mots de passe ne sont jamais pré-remplis (l'API ne les renvoie pas) */}
      <Input
        label="Mot de passe"
        id="newPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Laisser vide pour garder le mot de passe actuel"
        className="w-full"
      />
      <Input
        label="Mot de passe actuel"
        id="currentPassword"
        type="password"
        autoComplete="current-password"
        placeholder="Obligatoire seulement pour changer de mot de passe"
        className="w-full"
      />

      {/* Le bouton est DANS le <form> : c'est ce qui lui permet de l'envoyer */}
      <Button
        label={isPending ? "Enregistrement..." : "Modifier les informations"}
        variant="primary"
        type="submit"
        disabled={isPending}
      />
    </form>
  );
}