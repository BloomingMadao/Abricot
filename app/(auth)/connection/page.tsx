import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import AuthForm from "@/app/components/AuthForm/AuthForm"
import Logo from "@/public/image/logo.svg"

// The browser tab: "Connexion | Abricot"
export const metadata: Metadata = {
    title: "Connexion",
}

export default function Connection() {
    return(
            // The big spaces of the mockup (150px) from lg; smaller on a phone so the form stays visible
            <div className="flex flex-col items-center px-[30px] py-[30px] min-h-screen">
                <Image
                    src={Logo}
                    alt="Logo Abricot"
                    width={252.57}
                    height={32.17}
                    loading="eager"
                    className="mb-16 lg:mb-[150px]"
                />
                <h1>Connexion</h1>
                <AuthForm isLogin />
                {/* .link (globals.css): the shared link style (orange, underlined, focus outline) */}
                <Link href="#" className="link mb-16 mt-[20px] lg:mb-[150px]">Mot de passe oublié ?</Link>
                <p>Pas encore de compte ? <Link href="/register" className="link">Créer un compte</Link></p>
            </div>
    )
}