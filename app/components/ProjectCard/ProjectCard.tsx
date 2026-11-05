import Image from "next/image"
import Link from "next/link"
import Tag from "@/app/components/Tag/Tag"
import { getInitials } from "@/app/lib/utils"
import type { ProjectWithRole, UserSummary } from "@/app/lib/types"
import TeamIcon from "@/public/image/teamsIcon.svg"

type ProjectCardProps = {
    // ProjectWithRole (and not Project): this is what getProjects() returns,
    // with the owner, the members and the number of tasks (_count.tasks)
    project: ProjectWithRole
    // Number of completed tasks: getProjects() doesn't provide it,
    // the page computes it (see projects/page.tsx)
    doneTasks: number
}

// Beyond that, we show "+N" instead of all the avatars
const MAX_VISIBLE_MEMBERS = 4

// A Tag turned into a round 27px avatar (instead of its "pill" shape):
// p-0 removes .tag's padding, size-[27px] makes it square,
// and its rounded corners (rounded-[50px] in .tag) make it a circle.
// border border-white: the thin white outline separating overlapping avatars
const AVATAR_CLASSES = "flex size-[27px] items-center justify-center border border-white p-0"

// A person's initials (or the 1st letter of the email if they have no name)
function initialsOf(user: UserSummary) {
    return getInitials(user.name) || user.email.charAt(0).toUpperCase()
}

// An avatar's content: the initials ON SCREEN (aria-hidden: not read),
// the full name FOR SCREEN READERS (sr-only: invisible)
function avatarLabel(user: UserSummary) {
    return (
        <>
            <span aria-hidden="true">{initialsOf(user)}</span>
            <span className="sr-only">{user.name || user.email}</span>
        </>
    )
}

// No "async": the card waits for nothing (no await), it already receives its data
export default function ProjectCard({ project, doneTasks }: ProjectCardProps) {
    const totalTasks = project._count.tasks
    // No tasks = 0% (avoids a division by zero)
    const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)

    // ⚠️ The API does NOT include the owner in members: we add them to count the team
    const members = project.members.map((member) => member.user)
    const teamSize = members.length + 1
    const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS)
    const hiddenCount = members.length - visibleMembers.length

    // The whole card is clickable, but the LINK is still the title:
    // after:absolute after:inset-0 stretches its click area over the whole card (which is "relative").
    // A screen reader just announces "Project name, link" (and not the whole card).
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

    // Progress: text + bar + number of completed tasks
    const progression = (
        <div className="mt-12">
            <div className="flex items-center justify-between text-xs">
                <span className="text-grey-600">Progression</span>
                <span className="text-grey-800">{progress}%</span>
            </div>
            {/* role="progressbar" + aria-value*: a screen reader announces "Progression, 50 %" */}
            <div
                role="progressbar"
                aria-label="Progression"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="mt-4 h-[7px] overflow-hidden rounded-full bg-grey-200"
            >
                {/* The width of the orange bar = the percentage (style, because the value changes) */}
                <div className="h-full rounded-full bg-brand-dark" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-[5px] text-[11px] text-grey-600">
                {doneTasks}/{totalTasks} tâches terminées
            </p>
        </div>
    )

    // Team: mt-auto pushes this block to the bottom of the card (cards of equal height in the grid)
    const team = (
        <div className="mt-auto pt-[51px]">
            <p className="flex items-center gap-2 text-[11px] text-grey-600">
                <Image src={TeamIcon} alt="" />
                Équipe ({teamSize})
            </p>

            <ul className="mt-[13px] flex items-center text-sm">
                {/* The owner: orange avatar ("brand" variant) + "Propriétaire" label.
                    text-grey-800!: dark initials as in the mockup (see the members below) */}
                <li className="mr-1 flex items-center gap-[5px]">
                    <Tag label={avatarLabel(project.owner)} variant="brand" className={`${AVATAR_CLASSES} text-grey-800!`} />
                    <Tag label="Propriétaire" variant="brand" />
                </li>

                {/* The members: grey avatars ("grey" variant) that overlap (-ml-2).
                    text-grey-800!: the variant already sets a text color (text-grey-600).
                    When two Tailwind classes set the SAME thing, we don't get to choose which one wins:
                    the "!" at the end forces ours. */}
                {visibleMembers.map((user, index) => (
                    <li key={user.id} title={user.name || user.email} className={index > 0 ? "-ml-2" : ""}>
                        <Tag label={avatarLabel(user)} variant="grey" className={`${AVATAR_CLASSES} text-grey-800!`} />
                    </li>
                ))}

                {/* "+N": same grey avatar, grey text from the variant (no "!") */}
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
        // relative: for the title's stretched link
        // flex flex-col h-full: the card takes the full height of its row in the grid
        // has-[:focus-visible]: card outline when the link is reached with the keyboard
        <article className="relative flex h-full flex-col rounded-[10px] border border-grey-200 bg-white px-[34px] pt-[28px] pb-[29px] transition-shadow duration-300 hover:shadow-md has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-dark">
            {title}
            {description}
            {progression}
            {team}
        </article>
    )
}