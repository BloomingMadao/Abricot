import Image from "next/image"
import Logo_black from "@/public/image/logo_black.svg"

export default function Footer(){
    const year : string = new Date().getFullYear().toString()

    return(
        <footer className="flex items-center justify-between h-[68px] pl-[30px] pr-[55px] bg-white">
            <Image
                src={Logo_black}
                alt="Logo Abricot noir"
                loading="lazy"
                width={101}
                height={12.86}
            />
            <p className="text-base text-black">Abricot {year}</p>
        </footer>
    )
}