import Image from "next/image"
import Link from "next/link"
import Tag from "@/app/components/Tag/Tag"
import UserAvatar from "@/app/components/UserAvatar/UserAvatar"
import type { ProjectWithRole } from "@/app/lib/types"
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

// The "+N" bubble: the same round 27px shape as UserAvatar
// (p-0 removes .tag's padding, size-[27px] makes it square, .tag's rounded corners make it a circle).
// The avatars themselves are UserAvatar: the same component as in ContributorsBar and the tasks
// (before, ProjectCard had its own copy of the initials and of the hidden name)
const AVATAR_CLASSES = "flex size-[27px] items-center justify-center border p-0 border-white!"

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
    // h2: each card is a section of the "Mes projets" page (the h1).
    // Class h5: the same look as before
    const title = (
        <h2 className="h5">
            <Link href={`/projects/${project.id}`} className="outline-none after:absolute after:inset-0">
                {project.name}
            </Link>
        </h2>
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
                    UserAvatar: initials on screen, full name for screen readers */}
                <li className="mr-1 flex items-center gap-[5px]">
                    <UserAvatar user={project.owner} variant="brand" />
                    <Tag label="Propriétaire" variant="brand" />
                </li>

                {/* The members: grey avatars ("grey" variant, the default) that overlap (-ml-2) */}
                {visibleMembers.map((user, index) => (
                    <li key={user.id} title={user.name || user.email} className={index > 0 ? "-ml-2" : ""}>
                        <UserAvatar user={user} />
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
        // px-6 on a phone, the mockup's 34px from md
        <article className="relative flex h-full flex-col rounded-[10px] border border-grey-200 bg-white px-6 pt-[28px] pb-[29px] md:px-[34px] transition-shadow duration-300 hover:shadow-md has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-dark">
            {title}
            {description}
            {progression}
            {team}
        </article>
    )
}