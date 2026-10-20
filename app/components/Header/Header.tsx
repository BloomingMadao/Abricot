import Image from "next/image"
import Link from "next/link"
import Logo from '@/public/image/logo.svg'
import UserIcon from "../UserIcon/UserIcon"
export default function Header(){
    return (
        <header className="flex flex-row items-center color-white w-full-screen h-[94px] gap-32">
            <Link href="/dashboard">
                <Image 
                    src={Logo}
                    alt="logo_abricot"
                    loading="lazy"
                />
            </Link>
            <nav className="flex flex-row gap-12 justify-center items-center">
                <Link href="/dashboard">Tableau de bord</Link>
                <Link href="/projects" className="mr-[256px]">Projet</Link>
                <UserIcon/>
            </nav>

        </header>
    )
}