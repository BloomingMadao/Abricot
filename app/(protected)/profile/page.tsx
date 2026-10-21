import {logout} from "@/app/lib/actions"

export default function Profile(){
    return(
        <div>
            <h1>La page &quot;Mon compte&quot;</h1>

            <form action={logout}>
                <button type="submit" className="button">Déconnexion</button>

            </form>
        </div>
    )
}