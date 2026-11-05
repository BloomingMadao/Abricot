"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type ProfileFormState } from "@/app/lib/actions";
import Input from "@/app/components/Input/Input";
import Button from "@/app/components/Button/Button";
import Alert from "@/app/components/Alert/Alert";

type ProfileFormProps = {
  // The current info, fetched by the page (server component)
  firstname: string;
  lastname: string;
  email: string;
};

export default function ProfileForm({ firstname, lastname, email }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, undefined);

  // Same idea as in AuthForm: the alert dismissed with the cross
  const [dismissedState, setDismissedState] = useState<ProfileFormState>(undefined);

  return (
    <form action={formAction} className="mt-10">
      {/* Green alert if it's saved, red if there's an error */}
      {state && state !== dismissedState && (
        <Alert
          message={state.message}
          errors={state.errors}
          variant={state.success ? "success" : "error"}
          onClose={() => setDismissedState(state)}
        />
      )}

      {/* defaultValue: what the user just typed (after a submission),
          otherwise their current info */}
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

      {/* Passwords are never pre-filled (the API doesn't return them) */}
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

      {/* The button is INSIDE the <form>: that's what lets it submit it */}
      <Button
        label={isPending ? "Enregistrement..." : "Modifier les informations"}
        variant="primary"
        type="submit"
        disabled={isPending}
      />
    </form>
  );
}