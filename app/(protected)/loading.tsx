import Loader from "@/app/components/Loader/Loader"

// Fichier spécial de Next.js : affiché automatiquement pendant qu'une page
// de (protected) attend ses données (await getProfile(), etc.).
// Le Header et le Footer du layout restent affichés autour.
export default function Loading() {
    return (
        <div className="pt-22">
            <Loader />
        </div>
    )
}