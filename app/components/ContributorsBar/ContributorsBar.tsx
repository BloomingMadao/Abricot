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
        <section className="flex items-center justify-between gap-6 rounded-[10px] bg-grey-100 px-[50px] py-[18px]">
            {/* Like your other section titles: an h5 */}
            <h5 className="flex items-baseline gap-2.5">
                Contributeurs
                <span className="text-base font-normal text-grey-600">
                    {count} {count > 1 ? "personnes" : "personne"}
                </span>
            </h5>

            {/* text-sm: the same font size for the initials and the labels */}
            <ul className="flex flex-wrap items-center justify-end gap-2 text-sm">
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