import AuthImage from "@/app/components/AuthImage/AuthImage"

export default function AuthLayout({ children }: LayoutProps<'/'>) {
    return (
        <section className="flex min-h-screen">
            {/* Left column: the form takes up 1/3 of the width */}
            <div className="w-full lg:w-1/3">
                {children}
            </div>

            {/* Right column: the image (which changes with the URL) takes the remaining 2/3 */}
            <div className="relative hidden lg:block lg:w-2/3">
                <AuthImage />
            </div>
        </section>
    )
}