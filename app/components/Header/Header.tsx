import Image from "next/image"
import Link from "next/link"
import Logo from '@/public/image/logo.svg'
import UserIcon from "@/app/components/UserIcon/UserIcon"
import MenuItems from "@/app/components/MenuItems/MenuItems"
import {logout} from "@/app/lib/actions"
 

export default function Header(){
    return (
        <header className="flex items-center justify-between bg-white w-full h-[94px] gap-26 px-10">
            <Link href="/dashboard">
                <Image 
                    src={Logo}
                    alt="logo abricot"
                    loading="lazy"
                    width={147}
                    height={18.72}
                />
            </Link>
            <nav className="flex items-center gap-4">
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