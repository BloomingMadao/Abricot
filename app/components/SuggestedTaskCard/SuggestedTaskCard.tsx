import type { FormEvent } from "react"
import type { SuggestedTask } from "@/app/lib/actions"
import type { UserSummary } from "@/app/lib/types"
import { formatShortDate } from "@/app/lib/utils"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import ActionIcon from "@/app/components/ActionIcon/ActionIcon"
import ContributorsSelect from "@/app/components/ContributorsSelect/ContributorsSelect"

/** A task of the AI modal, as the user can edit it before adding it:
 *  dueDate: "YYYY-MM-DD", or "" for no due date; assignees: the people assigned
 *  (the people themselves, for their names, instead of the ids of SuggestedTask) */
export type EditableSuggestion = Omit<SuggestedTask, "assigneeIds"> & { assignees: UserSummary[] }

type SuggestedTaskCardProps = {
    // A task suggested by the AI (not saved yet). id: only used by React (key, field ids)
    task: EditableSuggestion & { id: string }
    // The project members (owner included): the only people who can be assigned
    members: UserSummary[]
    // Its position in the list (1, 2, 3...): all the cards can have the same title,
    // the screen reader needs it to know WHICH task "Supprimer" or "Modifier" is about
    position: number
    // true = the card shows the edit fields instead of the text
    isEditing: boolean
    onEdit: () => void
    onCancel: () => void
    onSave: (task: EditableSuggestion) => void
    onDelete: () => void
}

// A card of the AI modal ("Vos tâches..."): title, description, Supprimer | Modifier.
// Nothing is saved here: the AI form keeps the list until "+ Ajouter les tâches".
export default function SuggestedTaskCard({
    task,
    members,
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
        // getAll: one checked "assigneeIds" box per assigned person (their id),
        // turned back into people thanks to the members list
        const assigneeIds = formData.getAll("assigneeIds").map(String)
        onSave({
            title: String(formData.get("title") ?? "").trim(),
            description: String(formData.get("description") ?? "").trim(),
            dueDate: String(formData.get("dueDate") ?? ""),
            assignees: members.filter((member) => assigneeIds.includes(member.id)),
        })
    }

    // Shared style for "Supprimer" and "Modifier": small grey text with its icon
    const actionClass =
        "flex cursor-pointer items-center gap-[7px] transition-colors hover:text-grey-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"

    return (
        // Padding taken from the mockup (40px on the sides), 20px on a phone
        <article className="rounded-[10px] border border-grey-200 bg-white px-5 py-6 md:px-10">
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
                    {/* The same fields as the "Créer une tâche" modal.
                        variant="calendar": a date from today onwards. Not required: a suggested task
                        can stay without a due date (empty field = no due date) */}
                    <Input
                        label="Échéance"
                        id={`${task.id}-dueDate`}
                        name="dueDate"
                        variant="calendar"
                        defaultValue={task.dueDate}
                        className="mt-0 mb-4 w-full text-sm"
                    />
                    {/* options: only the project members. valueKey="id": the API expects user ids */}
                    <ContributorsSelect
                        label="Assigné à :"
                        name="assigneeIds"
                        options={members}
                        defaultSelected={task.assignees}
                        valueKey="id"
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
                    {/* h3: under the modal's title (h2). Class h5: the same look as before */}
                    <h3 className="h5">{task.title}</h3>
                    {task.description && <p className="mt-1 text-sm text-grey-600">{task.description}</p>}

                    {/* What "Modifier" lets the user choose: the due date and the assignees */}
                    <p className="mt-4 text-xs text-grey-600">
                        Échéance :{" "}
                        {task.dueDate ? (
                            <time dateTime={task.dueDate} className="text-grey-800">
                                {formatShortDate(task.dueDate)}
                            </time>
                        ) : (
                            <span className="text-grey-800">{formatShortDate(null)}</span>
                        )}
                        <span aria-hidden="true"> | </span>
                        Assigné à :{" "}
                        <span className="text-grey-800">
                            {task.assignees.length === 0
                                ? "personne"
                                : task.assignees.map((user) => user.name || user.email).join(", ")}
                        </span>
                    </p>

                    {/* Supprimer | Modifier (the mockup's order) */}
                    <div className="mt-[30px] flex items-center gap-4 text-xs text-grey-600">
                        <button type="button" onClick={onDelete} className={actionClass}>
                            {/* Trash can, the same as in TaskMenu (see ActionIcon) */}
                            <ActionIcon variant="delete" />
                            Supprimer
                            {/* For a screen reader: "Supprimer la tâche 2" rather than just "Supprimer" */}
                            <span className="sr-only"> la tâche {position}</span>
                        </button>
                        <span aria-hidden="true">|</span>
                        <button type="button" onClick={onEdit} className={actionClass}>
                            {/* Pencil, the same as in TaskMenu (see ActionIcon) */}
                            <ActionIcon variant="edit" />
                            Modifier
                            <span className="sr-only"> la tâche {position}</span>
                        </button>
                    </div>
                </>
            )}
        </article>
    )
}