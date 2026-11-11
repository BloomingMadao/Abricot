import Tag from "@/app/components/Tag/Tag"
import UserAvatar from "@/app/components/UserAvatar/UserAvatar"
import type { UserSummary } from "@/app/lib/types"

type ContributorsBarProps = {
    owner: UserSummary
    // The project members (⚠️ the API does NOT include the owner)
    members: UserSummary[]
}

// The grey "Contributeurs  3 personnes" bar on a project page,
// with each person: avatar + label ("Propriétaire", or their name)
export default function ContributorsBar({ owner, members }: ContributorsBarProps) {
    // +1: the owner, who is not in members
    const count = members.length + 1

    return (
        // Responsive: the people go below the title on a phone (flex-col),
        // on the same line from md (768px), with the mockup's padding (50px)
        <section className="flex flex-col items-start gap-4 rounded-[10px] bg-grey-100 px-5 py-[18px] md:flex-row md:items-center md:justify-between md:gap-6 md:px-[50px]">
            {/* h2: a section of the project page (the h1 is the project's name).
                Class h5: the same look as before */}
            <h2 className="h5 flex items-baseline gap-2.5">
                Contributeurs
                <span className="text-base font-normal text-grey-600">
                    {count} {count > 1 ? "personnes" : "personne"}
                </span>
            </h2>

            {/* text-sm: the same font size for the initials and the labels */}
            <ul className="flex flex-wrap items-center gap-2 text-sm md:justify-end">
                {/* The owner: orange avatar + "Propriétaire".
                    Their name isn't written: the avatar gives it to screen readers */}
                <li className="flex items-center gap-[5px]">
                    <UserAvatar user={owner} variant="brand" />
                    <Tag label="Propriétaire" variant="brand" />
                </li>

                {/* The members: grey avatar + their name (decorative: the name is already written) */}
                {members.map((member) => (
                    <li key={member.id} className="flex items-center gap-[5px]">
                        <UserAvatar user={member} decorative />
                        <Tag label={member.name || member.email} variant="grey" />
                    </li>
                ))}
            </ul>
        </section>
    )
}