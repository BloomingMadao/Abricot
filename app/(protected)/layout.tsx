import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";


export default function ProtectedLayout({ children }: LayoutProps<'/'>){
    return(
        <>
            <Header />
            <section className="min-h-screen">
                {children}
            </section>
            <Footer />
        </>

    )
}