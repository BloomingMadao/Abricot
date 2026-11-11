import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import AuthForm from "@/app/components/AuthForm/AuthForm"
import Logo from "@/public/image/logo.svg"

// The browser tab: "Inscription | Abricot"
export const metadata: Metadata = {
    title: "Inscription",
}

export default function Register() {
    return(
            <div className="flex flex-col items-center px-[30px] py-[30px] min-h-screen">
                <Image
                    src={Logo}
                    alt="Logo Abricot"
                    width={252.57}
                    height={32.17}
                    loading="eager"
                    className="mb-[30px] lg:mb-[70px]"
                />
                <h1>Inscription</h1>
                <AuthForm />
                {/* .link (globals.css): the shared link style (orange, underlined, focus outline) */}
                <Link href="#" className="link mb-[20px] mt-[10px]">Mot de passe oublié ?</Link>
                <p>Déjà inscrit ? <Link href="/connection" className="link">Connectez-vous</Link></p>
            </div>
    )
}