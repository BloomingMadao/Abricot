import Input from "@/app/components/Input/Input"
import { variantClasses } from "@/app/components/Tag/Tag"
import { TASK_STATUS_LABELS, TASK_STATUS_VARIANTS } from "@/app/lib/utils"
import type { TaskStatus } from "@/app/lib/types"

// Les 3 statuts des maquettes ("Annulée" n'est pas proposé)
const STATUS_CHOICES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

type TaskStatusPickerProps = {
    // Le statut coché au départ (aucun si absent : l'API met alors "À faire")
    defaultStatus?: string
}

// Le choix du statut d'une tâche : "À faire", "En cours", "Terminée".
// Sert dans les modales "Créer une tâche" ET "Modifier" (UpdateTaskForm).
// Un seul choix possible → des boutons radio, envoyés avec le formulaire sous le nom "status".
// Un Tag n'est qu'un affichage (un <span>) : on ne peut pas le "choisir".
// Ici, chaque radio est caché (sr-only) et son libellé prend l'apparence d'un Tag.
export default function TaskStatusPicker({ defaultStatus }: TaskStatusPickerProps) {
    return (
        <fieldset>
            <legend>Statut :</legend>
            <div className="mt-2 flex gap-2">
                {STATUS_CHOICES.map((status) => (
                    <Input
                        key={status}
                        id={`status-${status}`}
                        type="radio"
                        name="status"
                        value={status}
                        label={TASK_STATUS_LABELS[status]}
                        defaultChecked={defaultStatus === status}
                        // sr-only : le rond du radio est invisible, mais reste utilisable au clavier
                        className="sr-only"
                        // tag + variantClasses : l'apparence et les couleurs du Tag
                        // (py-0.5 text-sm : 26px de haut comme sur la maquette).
                        // border-transparent, puis has-[:checked]:border-current : une bordure
                        // de la couleur du texte apparaît sur le statut choisi.
                        // has-[:focus-visible] : contour quand on arrive dessus au clavier
                        wrapperClassName={`tag py-0.5 text-sm ${variantClasses[TASK_STATUS_VARIANTS[status]]} border-transparent has-[:checked]:border-current has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-grey-800`}
                    />
                ))}
            </div>
        </fieldset>
    )
}