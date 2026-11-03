import Image from "next/image"
import Link from "next/link"
import Tag from "@/app/components/Tag/Tag"
import { getInitials } from "@/app/lib/utils"
import type { ProjectWithRole, UserSummary } from "@/app/lib/types"
import TeamIcon from "@/public/image/teamsIcon.svg"

type ProjectCardProps = {
    // ProjectWithRole (et pas Project) : c'est ce que renvoie getProjects(),
    // avec le propriétaire, les membres et le nombre de tâches (_count.tasks)
    project: ProjectWithRole
    // Nombre de tâches terminées : getProjects() ne le donne pas,
    // c'est la page qui le calcule (voir projects/page.tsx)
    doneTasks: number
}

// Au-delà, on affiche "+N" au lieu de toutes les pastilles
const MAX_VISIBLE_MEMBERS = 4

// Un Tag transformé en pastille ronde de 27px (au lieu de sa forme de "pilule") :
// p-0 retire les marges intérieures de .tag, size-[27px] le rend carré,
// et ses coins arrondis (rounded-[50px] dans .tag) en font un rond.
// border border-white : le petit contour blanc qui sépare les pastilles qui se chevauchent
const AVATAR_CLASSES = "flex size-[27px] items-center justify-center border border-white p-0"

// Initiales d'une personne (ou 1re lettre de l'email si elle n'a pas de nom)
function initialsOf(user: UserSummary) {
    return getInitials(user.name) || user.email.charAt(0).toUpperCase()
}

// Le contenu d'une pastille : les initiales À L'ÉCRAN (aria-hidden : pas lues),
// le nom complet POUR LES LECTEURS D'ÉCRAN (sr-only : invisible)
function avatarLabel(user: UserSummary) {
    return (
        <>
            <span aria-hidden="true">{initialsOf(user)}</span>
            <span className="sr-only">{user.name || user.email}</span>
        </>
    )
}

// Pas de "async" : la carte n'attend rien (pas d'await), elle reçoit déjà ses données
export default function ProjectCard({ project, doneTasks }: ProjectCardProps) {
    const totalTasks = project._count.tasks
    // Pas de tâche = 0 % (on évite une division par zéro)
    const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)

    // ⚠️ L'API ne met PAS le propriétaire dans members : on l'ajoute pour compter l'équipe
    const members = project.members.map((member) => member.user)
    const teamSize = members.length + 1
    const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS)
    const hiddenCount = members.length - visibleMembers.length

    // Toute la carte est cliquable, mais le LIEN reste le titre :
    // after:absolute after:inset-0 étire sa zone de clic sur toute la carte (qui est "relative").
    // Un lecteur d'écran annonce juste "Nom du projet, lien" (et pas toute la carte).
    const title = (
        <h5>
            <Link href={`/projects/${project.id}`} className="outline-none after:absolute after:inset-0">
                {project.name}
            </Link>
        </h5>
    )

    const description = project.description && (
        <p className="mt-2 text-[14px] text-grey-600">{project.description}</p>
    )

    // Progression : texte + barre + nombre de tâches terminées
    const progression = (
        <div className="mt-12">
            <div className="flex items-center justify-between text-xs">
                <span className="text-grey-600">Progression</span>
                <span className="text-grey-800">{progress}%</span>
            </div>
            {/* role="progressbar" + aria-value* : un lecteur d'écran annonce "Progression, 50 %" */}
            <div
                role="progressbar"
                aria-label="Progression"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="mt-4 h-[7px] overflow-hidden rounded-full bg-grey-200"
            >
                {/* La largeur de la barre orange = le pourcentage (style, car la valeur change) */}
                <div className="h-full rounded-full bg-brand-dark" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-[5px] text-[11px] text-grey-600">
                {doneTasks}/{totalTasks} tâches terminées
            </p>
        </div>
    )

    // Équipe : mt-auto pousse ce bloc en bas de la carte (cartes de même hauteur dans la grille)
    const team = (
        <div className="mt-auto pt-[51px]">
            <p className="flex items-center gap-2 text-[11px] text-grey-600">
                <Image src={TeamIcon} alt="" />
                Équipe ({teamSize})
            </p>

            <ul className="mt-[13px] flex items-center text-sm">
                {/* Le propriétaire : pastille orange (variant "brand") + étiquette "Propriétaire".
                    text-grey-800! : initiales foncées comme sur la maquette (voir les membres plus bas) */}
                <li className="mr-1 flex items-center gap-[5px]">
                    <Tag label={avatarLabel(project.owner)} variant="brand" className={`${AVATAR_CLASSES} text-grey-800!`} />
                    <Tag label="Propriétaire" variant="brand" />
                </li>

                {/* Les membres : pastilles grises (variant "grey") qui se chevauchent (-ml-2).
                    text-grey-800! : le variant donne déjà une couleur de texte (text-grey-600).
                    Quand deux classes Tailwind règlent la MÊME chose, on ne choisit pas laquelle gagne :
                    le "!" à la fin force la nôtre. */}
                {visibleMembers.map((user, index) => (
                    <li key={user.id} title={user.name || user.email} className={index > 0 ? "-ml-2" : ""}>
                        <Tag label={avatarLabel(user)} variant="grey" className={`${AVATAR_CLASSES} text-grey-800!`} />
                    </li>
                ))}

                {/* "+N" : même pastille grise, texte gris du variant (pas de "!") */}
                {hiddenCount > 0 && (
                    <li className="-ml-2">
                        <Tag
                            label={
                                <>
                                    +{hiddenCount}
                                    <span className="sr-only"> autre(s) membre(s)</span>
                                </>
                            }
                            variant="grey"
                            className={AVATAR_CLASSES}
                        />
                    </li>
                )}
            </ul>
        </div>
    )

    return (
        // relative : pour le lien étiré du titre
        // flex flex-col h-full : la carte prend toute la hauteur de sa ligne dans la grille
        // has-[:focus-visible] : contour de la carte quand on arrive sur le lien au clavier
        <article className="relative flex h-full flex-col rounded-[10px] border border-grey-200 bg-white px-[34px] pt-[28px] pb-[29px] transition-shadow duration-300 hover:shadow-md has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-dark">
            {title}
            {description}
            {progression}
            {team}
        </article>
    )
}