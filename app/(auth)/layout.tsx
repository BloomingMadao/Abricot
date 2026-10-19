import AuthImage from "@/app/components/AuthImage/AuthImage"

export default function AuthLayout({ children }: LayoutProps<'/'>) {
    return (
        <section className="flex min-h-screen">
            {/* Colonne de gauche : le formulaire prend 1/3 de la largeur */}
            <div className="w-full lg:w-1/3">
                {children}
            </div>

            {/* Colonne de droite : l'image (qui change selon l'URL) prend les 2/3 restants */}
            <div className="relative hidden lg:block lg:w-2/3">
                <AuthImage />
            </div>
        </section>
    )
}