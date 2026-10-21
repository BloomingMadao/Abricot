import Image from "next/image"
import Link from "next/link"
import Logo from '@/public/image/logo.svg'
import UserIcon from "../UserIcon/UserIcon"
export default function Header(){
    return (
        <header className="flex items-center justify-between bg-white w-full h-[94px] gap-32 px-10">
            <Link href="/dashboard">
                <Image 
                    src={Logo}
                    alt="logo_abricot"
                    loading="lazy"
                    width={147}
                    height={18.72}
                />
            </Link>
            <nav className="flex items-center gap-4">
                <Link href="/dashboard" className="flex justify-center w-[248px] text-(--brand-color-dark)">Tableau de bord</Link>
                <Link href="/projects" className="flex justify-center w-[248px] text-(--brand-color-dark)">Projet</Link>
            </nav>

            <UserIcon/>

        </header>
    )
}