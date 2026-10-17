
import Link from "next/link"
import Image from "next/image"
import AuthForm from "@/app/components/AuthForm/AuthForm"
import Logo from "@/public/image/logo.svg"

export default function Register() {
    return(
            <div className="flex flex-col items-center px-[30px] py-[30px] min-h-screen">
                <Image
                    src={Logo}
                    alt="Logo Abricot"
                    width={252.57}
                    height={32.17}
                    loading="lazy"
                    className="mb-[70px]"
                />
                <h1>Inscription</h1>
                <AuthForm />
                <Link href="#" className="mb-[10px] mt-[10px]">Mot de passe oublié ?</Link>
                <p>Déjà inscrit ? <Link href="/connection">Connectez-vous</Link></p>
            </div>
    )
}