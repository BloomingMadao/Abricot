import Image from "next/image"
import Desk from "@/public/image/desk-img.jpg"

export default function AuthLayout({ children }: LayoutProps<'/'>) {
    return (
        <section className="flex min-h-screen">
            {/* Colonne de gauche : le formulaire prend 1/3 de la largeur */}
            <div className="w-full lg:w-1/3">
                {children}
            </div>

            {/* Colonne de droite : l'image prend les 2/3 restants */}
            <div className="relative hidden lg:block lg:w-2/3">
                <Image
                    src={Desk}
                    alt=""
                    fill
                    sizes="67vw"
                    loading="eager"
                    className="object-cover object-[100%_75%]"
                />
            </div>
        </section>
    )
}