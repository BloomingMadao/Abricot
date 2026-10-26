"use client";

import Form from "next/form";
import { useActionState, useState } from "react";
import { loginAction, registerAction, type AuthFormState } from "@/app/lib/actions";
import Input from "@/app/components/Input/Input";
import Button from "@/app/components/Button/Button";
import Alert from "@/app/components/Alert/Alert";

export default function AuthForm({ isLogin = false }: { isLogin?: boolean }) {
  // useActionState relie le formulaire à la Server Action :
  // - state      : ce que l'action a renvoyé (undefined au départ, puis l'erreur éventuelle)
  // - formAction : la fonction à donner au formulaire
  // - isPending  : true pendant que l'action tourne (pour désactiver le bouton)
  const [state, formAction, isPending] = useActionState(
    isLogin ? loginAction : registerAction,
    undefined
  );

  // L'erreur que l'utilisateur a fermée avec la croix.
  // Chaque envoi du formulaire renvoie un NOUVEL objet state :
  // une nouvelle erreur est donc différente de celle fermée, et réapparaît.
  const [dismissedState, setDismissedState] = useState<AuthFormState>(undefined);

  return (
    <Form className="flex flex-col" action={formAction}>
      {/* Message d'erreur renvoyé par l'API ou par la Server Action */}
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
          {/* id "mail" => name "mail" : c'est ce que loginAction lit avec formData.get("mail") */}
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

          {/* id "newPassword" : c'est ce que registerAction lit avec formData.get("newPassword") */}
          <Input
            label="Mot de passe"
            id="newPassword"
            variant="default"
            type="password"
            autoComplete="new-password"
            required
          />

          {/* id DIFFÉRENT du champ précédent, lu avec formData.get("confirmPassword") */}
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