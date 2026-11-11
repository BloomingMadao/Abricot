import type { Metadata } from "next"
import Image from "next/image"
import PageNotFound from "@/app/components/PageNotFound/PageNotFound"
import Logo from "@/public/image/logo.svg"

export const metadata: Metadata = { title: "Page introuvable" }

// Special Next.js file: shown for an address that doesn't exist (e.g. /abc)
export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-4">
            <Image src={Logo} alt="Abricot" width={200} loading="eager" />
            <PageNotFound />
        </main>
    )
}