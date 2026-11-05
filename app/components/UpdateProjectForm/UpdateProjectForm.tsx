"use client"

import { useActionState, useState } from "react"
import { updateProjectAction, type ProjectFormState } from "@/app/lib/actions"
import type { UserSummary } from "@/app/lib/types"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import ContributorsSelect from "@/app/components/ContributorsSelect/ContributorsSelect"

type UpdateProjectFormProps = {
    // The project to edit (to pre-fill the fields)
    project: { id: string; name: string; description: string | null }
    // The current contributors (without the owner): already checked in the list
    members: UserSummary[]
    // Owner's email: not offered (they always stay in the project)
    ownerEmail: string
    // Called when the project has been saved, to close the modal
    onSuccess: () => void
}

// The "Modifier le projet" form: the same as "Créer un projet", but pre-filled
export default function UpdateProjectForm({ project, members, ownerEmail, onSuccess }: UpdateProjectFormProps) {
    // We "wrap" the Server Action (like UpdateTaskForm):
    // on success, we notify the parent, which closes the modal
    async function submit(previousState: ProjectFormState, formData: FormData) {
        const result = await updateProjectAction(previousState, formData)
        if (result?.success) onSuccess()
        return result
    }

    const [state, formAction, isPending] = useActionState(submit, undefined)

    // "Enregistrer" is greyed out on open: nothing has changed yet (as in UpdateTaskForm).
    // On the 1st change, we check the form (empty title or description → stays greyed out).
    const [isValid, setIsValid] = useState(false)

    return (
        // onInput: on every keystroke or checked box, we re-check the form
        <form action={formAction} onInput={(event) => setIsValid(event.currentTarget.checkValidity())}>
            {/* Error returned by the API (name too short, contributor not found...) */}
            {state && !state.success && (
                <Alert message={state.message} errors={state.errors} variant="error" />
            )}

            {/* Hidden field: the action needs to know WHICH project to edit */}
            <input type="hidden" name="projectId" value={project.id} />

            {/* Values: what was submitted (after an error), otherwise the current project.
                mt-0 mb-4 w-full text-sm: spacing and size from the mockup (like UpdateTaskForm) */}
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

            {/* defaultSelected: the current contributors are already checked.
                Unchecking them removes them from the project, checking others (search) adds them. */}
            <ContributorsSelect
                label="Contributeurs"
                name="contributors"
                excludeEmail={ownerEmail}
                defaultSelected={members}
            />

            {/* mx-0: left-aligned like the fields, w-[181px]: its width in the mockup */}
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