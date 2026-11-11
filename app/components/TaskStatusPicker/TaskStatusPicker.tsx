import Input from "@/app/components/Input/Input"
import { variantClasses } from "@/app/components/Tag/Tag"
import { TASK_STATUS_LABELS, TASK_STATUS_VARIANTS } from "@/app/lib/utils"
import type { TaskStatus } from "@/app/lib/types"

// The 3 statuses from the mockups ("Annulée" is not offered)
const STATUS_CHOICES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

type TaskStatusPickerProps = {
    // The status checked at first (none if missing: the API then sets "À faire")
    defaultStatus?: string
}

// Choosing a task's status: "À faire", "En cours", "Terminée".
// Used in the "Créer une tâche" AND "Modifier" (UpdateTaskForm) modals.
// Only one choice possible → radio buttons, sent with the form under the name "status".
// A Tag is display-only (a <span>): it can't be "selected".
// Here, each radio is hidden (sr-only) and its label looks like a Tag.
export default function TaskStatusPicker({ defaultStatus }: TaskStatusPickerProps) {
    return (
        <fieldset>
            <legend>Statut :</legend>
            {/* flex-wrap: on a narrow phone, the 3rd status goes to the next line */}
            <div className="mt-2 flex flex-wrap gap-2">
                {STATUS_CHOICES.map((status) => (
                    <Input
                        key={status}
                        id={`status-${status}`}
                        type="radio"
                        name="status"
                        value={status}
                        label={TASK_STATUS_LABELS[status]}
                        defaultChecked={defaultStatus === status}
                        // sr-only: the radio circle is invisible, but still usable with the keyboard
                        className="sr-only"
                        // tag + variantClasses: the Tag's look and colors
                        // (py-0.5 text-sm: 26px tall as in the mockup).
                        // border-transparent, then has-[:checked]:border-current: a border
                        // in the text color appears on the chosen status.
                        // has-[:focus-visible]: outline when reached with the keyboard
                        wrapperClassName={`tag border py-0.5 text-sm ${variantClasses[TASK_STATUS_VARIANTS[status]]} border-transparent has-[:checked]:border-current has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-grey-800`}
                    />
                ))}
            </div>
        </fieldset>
    )
}