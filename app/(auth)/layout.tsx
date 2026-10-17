import Image from "next/image"
import Desk from "@/public/image/desk-img.jpg"



export default function AuthLayout({children}: LayoutProps<'/'>){
    return(  
            <section className="flex justify-center justify-items-center items-center min-h-screen">
                {children}
                <Image 
                    src ={Desk}
                    alt=''
                    width={1440}
                    height={1024}
                    loading="lazy"

                    className="max-h-screen max-w-md"
                />
            </section>
    )

}