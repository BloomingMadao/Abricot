"use client"

import { useActionState, useState } from "react"
import { updateProjectAction, type ProjectFormState } from "@/app/lib/actions"
import type { UserSummary } from "@/app/lib/types"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import ContributorsSelect from "@/app/components/ContributorsSelect/ContributorsSelect"

type UpdateProjectFormProps = {
    // Le projet à modifier (pour pré-remplir les champs)
    project: { id: string; name: string; description: string | null }
    // Les contributeurs actuels (sans le propriétaire) : déjà cochés dans la liste
    members: UserSummary[]
    // Email du propriétaire : on ne le propose pas (il reste toujours dans le projet)
    ownerEmail: string
    // Appelée quand le projet est bien enregistré, pour fermer la modale
    onSuccess: () => void
}

// Le formulaire "Modifier le projet" : le même que "Créer un projet", mais pré-rempli
export default function UpdateProjectForm({ project, members, ownerEmail, onSuccess }: UpdateProjectFormProps) {
    // On "enveloppe" la Server Action (comme UpdateTaskForm) :
    // si c'est un succès, on prévient le parent, qui ferme la modale
    async function submit(previousState: ProjectFormState, formData: FormData) {
        const result = await updateProjectAction(previousState, formData)
        if (result?.success) onSuccess()
        return result
    }

    const [state, formAction, isPending] = useActionState(submit, undefined)

    // "Enregistrer" est grisé à l'ouverture : rien n'a encore changé (comme dans UpdateTaskForm).
    // À la 1re modification, on vérifie le formulaire (titre ou description vide → reste grisé).
    const [isValid, setIsValid] = useState(false)

    return (
        // onInput : à chaque frappe ou case cochée, on revérifie le formulaire
        <form action={formAction} onInput={(event) => setIsValid(event.currentTarget.checkValidity())}>
            {/* Erreur renvoyée par l'API (nom trop court, contributeur introuvable...) */}
            {state && !state.success && (
                <Alert message={state.message} errors={state.errors} variant="error" />
            )}

            {/* Champ caché : l'action doit savoir QUEL projet modifier */}
            <input type="hidden" name="projectId" value={project.id} />

            {/* Valeurs : ce qui a été envoyé (après une erreur), sinon le projet actuel.
                mt-0 mb-4 w-full text-sm : espacements et taille de la maquette (comme UpdateTaskForm) */}
            <Input
                label="Titre*"
                id="name"
                type="text"
                required
                autoComplete="off"
                defaultValue={state?.values.name ?? project.name}
                className="mt-0 mb-4 w-full text-sm"
            />
            <Input
                label="Description*"
                id="description"
                type="text"
                required
                autoComplete="off"
                defaultValue={state?.values.description ?? project.description ?? ""}
                className="mt-0 mb-4 w-full text-sm"
            />

            {/* defaultSelected : les contributeurs actuels sont déjà cochés.
                Les décocher les retire du projet, en cocher d'autres (recherche) les ajoute. */}
            <ContributorsSelect
                label="Contributeurs"
                name="contributors"
                excludeEmail={ownerEmail}
                defaultSelected={members}
            />

            {/* mx-0 : aligné à gauche comme les champs, w-[181px] : sa largeur sur la maquette */}
            <Button
                label={isPending ? "Enregistrement..." : "Enregistrer"}
                variant="primary"
                type="submit"
                disabled={!isValid || isPending}
                className="mx-0 mt-8 w-[181px]"
            />
        </form>
    )
}