import Link from "next/link"
import Image from "next/image"
import AuthForm from "@/app/components/AuthForm/AuthForm"
import Logo from "@/public/image/logo.svg"


export default function Connection() {
    return(
            <div className="flex flex-col items-center px-[30px] py-[30px] min-h-screen">
                <Image
                    src={Logo}
                    alt="Logo Abricot"
                    width={252.57}
                    height={32.17}
                    loading="lazy"
                    className="mb-[150px]"
                />
                <h1>Connexion</h1>
                <AuthForm isLogin />
                <Link href="#" className="mb-[150px]">Mot de passe oublié ?</Link>
                <p>Pas encore de compte ? <Link href="/register">Créer un compte</Link></p>
            </div>
    )
}