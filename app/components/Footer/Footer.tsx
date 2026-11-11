import Image from "next/image"
import Logo_black from "@/public/image/logo_black.svg"

export default function Footer(){
    const year : string = new Date().getFullYear().toString()

    return(
        // Responsive: 16px on each side on a phone, the mockup's margins from md
        <footer className="flex h-[68px] items-center justify-between bg-white px-4 md:pr-[55px] md:pl-[30px]">
            <Image
                src={Logo_black}
                alt="Logo Abricot noir"
                loading="lazy"
                width={101}
            />
            <p className="text-base text-black">Abricot {year}</p>
        </footer>
    )
}