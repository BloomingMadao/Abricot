import { getProfile } from "@/app/lib/api"
import Alert from "@/app/components/Alert/Alert"
import ProfileForm from "@/app/components/ProfileForm/ProfileForm"

export default async function Profile() {
    // getProfile() DANS la fonction : il est appelé à chaque visite,
    // avec le cookie de la personne connectée
    const responseUser = await getProfile()

    // Profil introuvable : message au lieu d'une page blanche (comme sur le dashboard)
    if (!responseUser.success) {
        return (
            <div className="px-25 pt-14">
                <Alert message="Impossible de charger votre profil." />
            </div>
        )
    }

    const { user } = responseUser.data

    // Le backend stocke "Prénom Nom" dans un seul champ :
    // "Alice Martin" → prénom "Alice", nom "Martin"
    const [firstname = "", ...otherWords] = (user.name ?? "")
        .split(" ")
        .filter((word) => word !== "")
    const lastname = otherWords.join(" ")

    return (
        <div className="px-25 pt-14 pb-20">
            <div className="rounded-[10px] border border-grey-200 bg-white px-[59px] py-10">
                {/* h1 : le titre principal de la page, avec le style de la maquette */}
                <h1 className="mb-0 text-lg font-semibold text-grey-800">Mon compte</h1>
                <p className="mt-1 text-grey-600">{user.name || user.email}</p>

                {/* Le formulaire est un composant CLIENT (useActionState),
                    la page lui passe les infos actuelles */}
                <ProfileForm firstname={firstname} lastname={lastname} email={user.email} />
            </div>
        </div>
    )
}