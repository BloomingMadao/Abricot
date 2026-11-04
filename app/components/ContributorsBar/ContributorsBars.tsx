import Tag from "@/app/components/Tag/Tag"
import UserAvatar from "@/app/components/UserAvatar/UserAvatar"
import type { UserSummary } from "@/app/lib/types"

type ContributorsBarProps = {
    owner: UserSummary
    // Les membres du projet (⚠️ l'API ne met PAS le propriétaire dedans)
    members: UserSummary[]
}

// La barre grise "Contributeurs  3 personnes" de la page d'un projet,
// avec chaque personne : pastille + étiquette (Propriétaire, ou son nom)
export default function ContributorsBar({ owner, members }: ContributorsBarProps) {
    // +1 : le propriétaire, qui n'est pas dans members
    const count = members.length + 1

    return (
        <section className="flex items-center justify-between gap-6 rounded-[10px] bg-grey-100 px-[50px] py-[18px]">
            {/* Comme tes autres titres de section : un h5 */}
            <h5 className="flex items-baseline gap-2.5">
                Contributeurs
                <span className="text-base font-normal text-grey-600">
                    {count} {count > 1 ? "personnes" : "personne"}
                </span>
            </h5>

            {/* text-sm : la même taille de police pour les initiales et les étiquettes */}
            <ul className="flex flex-wrap items-center justify-end gap-2 text-sm">
                {/* Le propriétaire : pastille orange + "Propriétaire".
                    Son nom n'est pas écrit : la pastille le donne au lecteur d'écran */}
                <li className="flex items-center gap-[5px]">
                    <UserAvatar user={owner} variant="brand" />
                    <Tag label="Propriétaire" variant="brand" />
                </li>

                {/* Les membres : pastille grise + leur nom (decorative : le nom est déjà écrit) */}
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