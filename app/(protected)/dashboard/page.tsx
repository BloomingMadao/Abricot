import { getProfile } from "@/app/lib/api"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"

export default async function Dashboard() {
    const responseUser = await getProfile()

    // Profil introuvable : on affiche un message plutôt qu'une page blanche.
    // (Pas de redirect("/connection") ici : le cookie existe encore, donc
    //  proxy.ts renverrait aussitôt vers /dashboard → boucle infinie.)
    if (!responseUser.success) {
        return (
            <div className="px-25 pt-22">
                <Alert message="Impossible de charger votre profil." />
            </div>
        )
    }

    const { user } = responseUser.data
    // name peut être null (inscription sans nom) : on affiche alors l'email
    const name = user.name || user.email

    return (
        <>
            <div className="px-25 pt-22">
                {/* En-tête : titre + phrase à gauche, bouton à droite */}
                <div className="flex items-center justify-between">
                    <div>
                        {/* h1 : le titre principal de la page (un seul par page).
                            Les classes remplacent le style global des h1 (40px orange). */}
                        <h1 className="mb-0 text-2xl font-semibold text-grey-800">Tableau de bord</h1>
                        <p className="mt-4 text-lg">
                            Bonjour {name}, voici un aperçu de vos projets et tâches
                        </p>
                    </div>

                    {/* type="button" : on n'est pas dans un formulaire.
                        Plus tard, ce bouton ouvrira la création de projet. */}
                    <Button
                        label="+ Créer un projet"
                        type="button"
                        variant="primary"
                    />
                </div>
            </div>
            <div>

            </div>
        </>

    )
}