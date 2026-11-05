"use client";

import Form from "next/form";
import { useActionState, useState } from "react";
import { loginAction, registerAction, type AuthFormState } from "@/app/lib/actions";
import Input from "@/app/components/Input/Input";
import Button from "@/app/components/Button/Button";
import Alert from "@/app/components/Alert/Alert";

export default function AuthForm({ isLogin = false }: { isLogin?: boolean }) {
  // useActionState connects the form to the Server Action:
  // - state      : what the action returned (undefined at first, then the error if any)
  // - formAction : the function to pass to the form
  // - isPending  : true while the action is running (to disable the button)
  const [state, formAction, isPending] = useActionState(
    isLogin ? loginAction : registerAction,
    undefined
  );

  // The error the user dismissed with the cross.
  // Each form submission returns a NEW state object:
  // so a new error is different from the dismissed one, and shows up again.
  const [dismissedState, setDismissedState] = useState<AuthFormState>(undefined);

  return (
    <Form className="flex flex-col" action={formAction}>
      {/* Error message returned by the API or by the Server Action */}
      {state && state !== dismissedState && (
        <Alert
          message={state.message}
          errors={state.errors}
          variant="error"
          onClose={() => setDismissedState(state)}
        />
      )}

      {isLogin && (
        <>
          {/* id "mail" => name "mail": this is what loginAction reads with formData.get("mail") */}
          <Input
            label="Email"
            id="mail"
            variant="default"
            type="email"
            autoComplete="email"
            required
            defaultValue={state?.values.mail}
          />
          <Input
            label="Mot de passe"
            id="password"
            variant="default"
            type="password"
            autoComplete="current-password"
            required
          />

          <Button
            label={isPending ? "Connexion..." : "Se connecter"}
            variant="primary"
            type="submit"
            disabled={isPending}
          />
        </>
      )}

      {!isLogin && (
        <>
          <Input
            label="Prénom"
            id="firstname"
            variant="default"
            type="text"
            autoComplete="given-name"
            required
            defaultValue={state?.values.firstname}
          />
          <Input
            label="Nom"
            id="lastname"
            variant="default"
            type="text"
            autoComplete="family-name"
            required
            defaultValue={state?.values.lastname}
          />
          <Input
            label="Email"
            id="mail"
            variant="default"
            type="email"
            autoComplete="email"
            required
            defaultValue={state?.values.mail}
          />

          {/* id "newPassword": this is what registerAction reads with formData.get("newPassword") */}
          <Input
            label="Mot de passe"
            id="newPassword"
            variant="default"
            type="password"
            autoComplete="new-password"
            required
          />

          {/* DIFFERENT id from the previous field, read with formData.get("confirmPassword") */}
          <Input
            label="Confirmation du mot de passe"
            id="confirmPassword"
            variant="default"
            type="password"
            autoComplete="new-password"
            required
          />

          <Button
            label={isPending ? "Inscription..." : "S'inscrire"}
            variant="primary"
            type="submit"
            disabled={isPending}
          />
        </>
      )}
    </Form>
  );
}