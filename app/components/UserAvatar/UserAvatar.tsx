import Tag, { type TagVariant } from "@/app/components/Tag/Tag"
import { getInitials } from "@/app/lib/utils"
import type { UserSummary } from "@/app/lib/types"

type UserAvatarProps = {
    user: UserSummary
    // "brand" (orange) for the owner, "grey" for the others
    variant?: TagVariant
    // true when the full name is ALREADY written next to it (e.g. a "Bertrand Dupont" label):
    // the avatar is then purely decorative, so the screen reader doesn't read the name twice
    decorative?: boolean
}

// A round avatar with a person's initials.
// It's a Tag turned into a 27px circle (as in ProjectCard):
// p-0 removes .tag's padding, size-[27px] makes it square,
// and its rounded corners (rounded-[50px] in .tag) make it a circle.
// No font size: it comes from the parent (same size as the labels next to it).
export default function UserAvatar({ user, variant = "grey", decorative = false }: UserAvatarProps) {
    // Initials, or the 1st letter of the email if the person has no name
    const initials = getInitials(user.name) || user.email.charAt(0).toUpperCase()

    return (
        <Tag
            label={
                <>
                    {/* aria-hidden: initials alone mean nothing when read aloud */}
                    <span aria-hidden="true">{initials}</span>
                    {!decorative && <span className="sr-only">{user.name || user.email}</span>}
                </>
            }
            variant={variant}
            // text-grey-800!: dark initials as in the mockups
            // (the "!" takes precedence over the variant's text color).
            // border-white!: the thin white outline of the mockup (the "!" takes precedence
            // over the Tag's border-transparent)
            className="flex size-[27px] shrink-0 items-center justify-center border p-0 border-white! text-grey-800!"
        />
    )
}