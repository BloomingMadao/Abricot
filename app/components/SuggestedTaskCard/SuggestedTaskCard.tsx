import type { FormEvent } from "react"
import type { SuggestedTask } from "@/app/lib/actions"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"

type SuggestedTaskCardProps = {
    // A task suggested by the AI (not saved yet). id: only used by React (key, field ids)
    task: SuggestedTask & { id: string }
    // Its position in the list (1, 2, 3...): all the cards can have the same title,
    // the screen reader needs it to know WHICH task "Supprimer" or "Modifier" is about
    position: number
    // true = the card shows the edit fields instead of the text
    isEditing: boolean
    onEdit: () => void
    onCancel: () => void
    onSave: (task: SuggestedTask) => void
    onDelete: () => void
}

// A card of the AI modal ("Vos tâches..."): title, description, Supprimer | Modifier.
// Nothing is saved here: the AI form keeps the list until "+ Ajouter les tâches".
export default function SuggestedTaskCard({
    task,
    position,
    isEditing,
    onEdit,
    onCancel,
    onSave,
    onDelete,
}: SuggestedTaskCardProps) {
    // Edit form: we read the fields when it's submitted (Enregistrer or Enter).
    // preventDefault: no page reload, React updates the list instead
    function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        onSave({
            title: String(formData.get("title") ?? "").trim(),
            description: String(formData.get("description") ?? "").trim(),
        })
    }

    // Shared style for "Supprimer" and "Modifier": small grey text with its icon
    const actionClass =
        "flex cursor-pointer items-center gap-[7px] transition-colors hover:text-grey-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"

    return (
        // Padding taken from the mockup (40px on the sides)
        <article className="rounded-[10px] border border-grey-200 bg-white px-10 py-6">
            {isEditing ? (
                <form onSubmit={save}>
                    {/* Same rules as the API: title from 2 to 200 characters, description up to 1000 */}
                    <Input
                        label="Titre"
                        id={`${task.id}-title`}
                        name="title"
                        type="text"
                        required
                        minLength={2}
                        maxLength={200}
                        autoComplete="off"
                        defaultValue={task.title}
                        // autoFocus: after clicking "Modifier", we can type right away
                        autoFocus
                        className="mt-0 mb-4 w-full text-sm"
                    />
                    <Input
                        variant="textarea"
                        label="Description"
                        id={`${task.id}-description`}
                        name="description"
                        rows={3}
                        maxLength={1000}
                        defaultValue={task.description}
                        className="mt-0 mb-4 w-full text-sm"
                    />
                    <div className="flex flex-wrap gap-3">
                        <Button
                            label="Annuler"
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                            className="mx-0 w-auto px-7"
                        />
                        <Button label="Enregistrer" type="submit" variant="primary" className="mx-0 w-auto px-7" />
                    </div>
                </form>
            ) : (
                <>
                    <h5>{task.title}</h5>
                    {task.description && <p className="mt-1 text-sm text-grey-600">{task.description}</p>}

                    {/* Supprimer | Modifier (the mockup's order) */}
                    <div className="mt-[30px] flex items-center gap-4 text-xs text-grey-600">
                        <button type="button" onClick={onDelete} className={actionClass}>
                            {/* Trash can, drawn in SVG like in TaskMenu (currentColor: the text color) */}
                            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
                                <path d="M4 0h4l.5 1H12v1.5H0V1h3.5L4 0ZM1 3.5h10l-.7 9.6A1 1 0 0 1 9.3 14H2.7a1 1 0 0 1-1-.9L1 3.5Z" />
                            </svg>
                            Supprimer
                            {/* For a screen reader: "Supprimer la tâche 2" rather than just "Supprimer" */}
                            <span className="sr-only"> la tâche {position}</span>
                        </button>
                        <span aria-hidden="true">|</span>
                        <button type="button" onClick={onEdit} className={actionClass}>
                            {/* Pencil, drawn in SVG like in TaskMenu */}
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                                <path d="M10.3.7a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L5 12 1 13l1-4L10.3.7Z" />
                            </svg>
                            Modifier
                            <span className="sr-only"> la tâche {position}</span>
                        </button>
                    </div>
                </>
            )}
        </article>
    )
}