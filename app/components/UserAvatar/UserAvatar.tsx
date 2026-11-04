import Tag, { type TagVariant } from "@/app/components/Tag/Tag"
import { getInitials } from "@/app/lib/utils"
import type { UserSummary } from "@/app/lib/types"

type UserAvatarProps = {
    user: UserSummary
    // "brand" (orange) pour le propriétaire, "grey" pour les autres
    variant?: TagVariant
    // true quand le nom complet est DÉJÀ écrit à côté (ex : étiquette "Bertrand Dupont") :
    // la pastille est alors juste décorative, le lecteur d'écran ne lit pas le nom deux fois
    decorative?: boolean
}

// Une pastille ronde avec les initiales d'une personne.
// C'est un Tag transformé en rond de 27px (comme dans ProjectCard) :
// p-0 retire les marges intérieures de .tag, size-[27px] le rend carré,
// et ses coins arrondis (rounded-[50px] dans .tag) en font un rond.
// Pas de taille de police : elle vient du parent (même taille que les étiquettes à côté).
export default function UserAvatar({ user, variant = "grey", decorative = false }: UserAvatarProps) {
    // Initiales, ou 1re lettre de l'email si la personne n'a pas de nom
    const initials = getInitials(user.name) || user.email.charAt(0).toUpperCase()

    return (
        <Tag
            label={
                <>
                    {/* aria-hidden : les initiales seules ne veulent rien dire à l'oreille */}
                    <span aria-hidden="true">{initials}</span>
                    {!decorative && <span className="sr-only">{user.name || user.email}</span>}
                </>
            }
            variant={variant}
            // text-grey-800! : initiales foncées comme sur les maquettes
            // (le "!" passe devant la couleur de texte du variant)
            className="flex size-[27px] shrink-0 items-center justify-center border border-white p-0 text-grey-800!"
        />
    )
}