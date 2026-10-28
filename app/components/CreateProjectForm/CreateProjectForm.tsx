"use client"

import { useActionState, useState } from "react"
import { createProjectAction, type ProjectFormState } from "@/app/lib/actions"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import ContributorsSelect from "@/app/components/ContributorsSelect/ContributorsSelect"

type CreateProjectFormProps = {
    // Appelée quand le projet est bien créé (avec son nom), pour fermer la modale
    onSuccess: (projectName: string) => void
    // Email de la personne connectée : on ne la propose pas comme contributeur
    currentUserEmail?: string
}

export default function CreateProjectForm({ onSuccess, currentUserEmail }: CreateProjectFormProps) {
    // On "enveloppe" la Server Action : on l'appelle, puis on regarde le résultat.
    // Si c'est un succès, on prévient le parent (qui ferme la modale).
    async function submit(previousState: ProjectFormState, formData: FormData) {
        const result = await createProjectAction(previousState, formData)
        if (result?.success) onSuccess(result.values.name)
        return result
    }

    const [state, formAction, isPending] = useActionState(submit, undefined)

    // Bouton grisé tant que les champs obligatoires (required) ne sont pas remplis.
    // checkValidity() demande au navigateur si TOUS les champs du formulaire sont valides.
    // Au départ les champs sont vides : le formulaire n'est pas valide.
    const [isValid, setIsValid] = useState(false)

    return (
        // onInput : à chaque frappe dans un champ, on revérifie le formulaire
        <form action={formAction} onInput={(event) => setIsValid(event.currentTarget.checkValidity())}>
            {/* Erreur renvoyée par l'API (nom trop court, trop long...) */}
            {state && !state.success && (
                <Alert message={state.message} errors={state.errors} variant="error" />
            )}

            <Input
                label="Titre*"
                id="name"
                type="text"
                required
                autoComplete="off"
                defaultValue={state?.values.name}
                className="mt-0 mb-6 w-full"
            />
            <Input
                label="Description*"
                id="description"
                type="text"
                required
                autoComplete="off"
                defaultValue={state?.values.description}
                className="mt-0 mb-6 w-full"
            />
            <ContributorsSelect label="Contributeurs" name="contributors" excludeEmail={currentUserEmail} />

            {/* Champs : mt-0 mb-6 = espacements plus serrés de la maquette (au lieu de ceux de .input-default)
                className : les classes Tailwind passent devant celles de .button-primary
                (mx-0 : aligné à gauche comme les champs, w-auto + px-7 : largeur de la maquette) */}
            <Button
                label={isPending ? "Création..." : "Ajouter un projet"}
                variant="primary"
                type="submit"
                disabled={!isValid || isPending}
            />
        </form>
    )
}