import Image from "next/image"
import Link from "next/link"
import Logo from '@/public/image/logo.svg'
import UserIcon from "@/app/components/UserIcon/UserIcon"
import MenuItems from "@/app/components/MenuItems/MenuItems"
import MobileNav from "@/app/components/MobileNav/MobileNav"
 

export default function Header(){
    return (
        // Responsive (mobile first): 64px tall on a phone, the mockup's 94px from md (768px).
        // The gaps grow with the screen (gap-26 = the mockup's spacing, from lg)
        <header className="flex h-16 w-full items-center justify-between gap-3 bg-white px-4 md:h-[94px] md:gap-6 md:px-10 lg:gap-26">
            {/* Phone: the logo opens a dropdown menu with the two links (MobileNav).
                md:hidden: not displayed from md */}
            <div className="md:hidden">
                <MobileNav />
            </div>

            {/* From md: the logo leads to the dashboard, the two links are in the header (the mockup).
                hidden md:block / md:flex: not displayed on a phone.
                The logo's alt is the link's name for a screen reader */}
            <Link href="/dashboard" className="hidden shrink-0 md:block">
                <Image 
                    src={Logo}
                    alt="Abricot, tableau de bord"
                    loading="eager"
                    width={147}
                />
            </Link>
            {/* aria-label: names the navigation for screen readers ("Navigation principale") */}
            <nav aria-label="Navigation principale" className="hidden items-center gap-4 md:flex">
                <MenuItems 
                    label="Tableau de bord"
                    icon="dashboard"
                    href="/dashboard"
                />
                <MenuItems
                    label="Projets"
                    icon="folder"
                    href="/projects"
                />
            </nav>
            <UserIcon/>

        </header>
    )
}