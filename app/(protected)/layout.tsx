import Footer from "@/app/components/Footer/Footer";
import Header from "@/app/components/Header/Header";


export default function ProtectedLayout({ children }: LayoutProps<'/'>){
    return(
        <>
            {/* "Aller au contenu": the first link of the page, only visible when reached with the
                keyboard (Tab). Keyboard and screen reader users skip the menu (WCAG 2.4.1) */}
            <a
                href="#contenu"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-[10px] focus:bg-white focus:px-4 focus:py-3 focus:text-brand-dark focus:outline-2 focus:outline-brand-dark"
            >
                Aller au contenu
            </a>
            <Header />
            {/* <main>: only the content of the page (the header and the footer are outside) */}
            <main id="contenu" className="min-h-screen">
                {children}
            </main>
            <Footer />
        </>

    )
}