"use client"

import { useActionState, useState } from "react"
import { createProjectAction } from "@/app/lib/actions"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import ContributorsSelect from "@/app/components/ContributorsSelect/ContributorsSelect"

type CreateProjectFormProps = {
    // Logged-in user's email: they are not suggested as a contributor
    currentUserEmail?: string
}

export default function CreateProjectForm({ currentUserEmail }: CreateProjectFormProps) {
    // If creation succeeds, the action redirects to the new project's page
    // (the modal disappears with the page). Otherwise it returns the error, shown below.
    // isPending stays true until we reach the new page: "Création..." the whole time.
    const [state, formAction, isPending] = useActionState(createProjectAction, undefined)

    // Button greyed out until the required fields are filled in.
    // checkValidity() asks the browser whether ALL the form's fields are valid.
    // At first the fields are empty: the form is not valid.
    const [isValid, setIsValid] = useState(false)

    return (
        // onInput: on every keystroke in a field, we re-check the form
        <form action={formAction} onInput={(event) => setIsValid(event.currentTarget.checkValidity())}>
            {/* Error returned by the API (name too short, too long...) */}
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

            {/* Fields: mt-0 mb-6 = the mockup's tighter spacing (instead of .input-default's)
                className: Tailwind classes take precedence over those of .button-primary
                (mx-0: left-aligned like the fields, w-auto + px-7: width from the mockup) */}
            <Button
                label={isPending ? "Création..." : "Ajouter un projet"}
                variant="primary"
                type="submit"
                disabled={!isValid || isPending}
            />
        </form>
    )
}