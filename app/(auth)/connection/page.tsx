import Link from "next/link"
import AuthForm from "@/app/components/AuthForm/AuthForm"

export default function Connection() {
    return(
        <div>
            <h1>La page de connexion</h1>
            <AuthForm 
                isLogin
            />
            <p>Pas encore de compte ? <Link href="/register">Créer un compte</Link> </p>
        </div>
    )
}