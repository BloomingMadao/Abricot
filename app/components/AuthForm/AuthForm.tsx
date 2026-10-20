"use client";

import Form from "next/form";
import { useActionState } from "react";
import { loginAction, registerAction } from "@/app/lib/actions";

export default function AuthForm({ isLogin = false }: { isLogin?: boolean }) {
  // useActionState relie le formulaire à la Server Action :
  // - state      : ce que l'action a renvoyé (undefined au départ, puis l'erreur éventuelle)
  // - formAction : la fonction à donner au formulaire
  // - isPending  : true pendant que l'action tourne (pour désactiver le bouton)
  const [state, formAction, isPending] = useActionState(
    isLogin ? loginAction : registerAction,
    undefined
  );

  return (
    <Form className="flex flex-col" action={formAction}>
      {/* Message d'erreur renvoyé par l'API */}
      {state && (
        <div role="alert" className="mb-[20px]">
          <p>{state.message}</p>
          {state.errors.length > 0 && (
            <ul>
              {state.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isLogin && (
        <>
          <label htmlFor="mail">Email</label>
          <input type="email" name="mail" id="mail" autoComplete="email" required className="input" defaultValue={state?.values.mail} />
          <label htmlFor="password">Mot de passe</label>
          <input type="password" name="password" id="password" autoComplete="current-password" required className="input" />
          <button type="submit" disabled={isPending} className="button">
            {isPending ? "Connexion..." : "Se connecter"}
          </button>
        </>
      )}

      {!isLogin && (
        <>
          <label htmlFor="firstname">Pr&eacute;nom</label>
          <input type="text" name="firstname" id="firstname" required className="input" defaultValue={state?.values.firstname} />
          <label htmlFor="lastname">Nom</label>
          <input type="text" name="lastname" id="lastname" required className="input" defaultValue={state?.values.lastname} />
          <label htmlFor="mail">Email</label>
          <input type="email" name="mail" id="mail" autoComplete="email" required className="input" defaultValue={state?.values.mail} />
          <label htmlFor="newPassword">Mot de passe</label>
          <input type="password" name="newPassword" id="newPassword" autoComplete="new-password" required className="input" />
          <button type="submit" disabled={isPending} className="button">
            {isPending ? "Inscription..." : "S'inscrire"}
          </button>
        </>
      )}
    </Form>
  );
}
