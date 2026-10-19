import Image from "next/image";
import Logo from "@/public/image/logo.svg"

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Image
        src={Logo}
        loading="eager"
        alt=""
      />
      <p>Site en cours de construction</p>
    </div>
  );
}
