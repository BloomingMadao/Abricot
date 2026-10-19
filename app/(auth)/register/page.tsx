
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
                    className="mb-[30px] lg:mb-[70px]"
                />
                <h1>Inscription</h1>
                <AuthForm />
                <Link href="#" className="mb-[20px] mt-[10px] text-(--brand-color) underline underline-offset-4 hover:text-black">Mot de passe oublié ?</Link>
                <p>Déjà inscrit ? <Link href="/connection" className="text-(--brand-color) underline underline-offset-4 hover:text-black">Connectez-vous</Link></p>
            </div>
    )
}