import Image from "next/image";
import Logo from "@/public/image/logo.svg"
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Image
        src={Logo}
        loading="eager"
        alt=""
      />
      <p>Site en cours de construction</p>
      <Link href="/connection">Page de connexion </Link>
      <Link href="/register">Page d&apo;inscription</Link>
    </div>
  );
}
