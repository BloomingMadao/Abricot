"use client";

import Image, { type StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import DeskConnection from "@/public/image/desk-img.jpg";
import DeskRegister from "@/public/image/desk-register.jpg";

// Quelle image pour quelle URL
const images: Record<string, StaticImageData> = {
  "/connection": DeskConnection,
  "/register": DeskRegister,
};

export default function AuthImage() {
  // L'URL actuelle, par exemple "/connection" ou "/register"
  const pathname = usePathname();

  // L'image qui correspond à l'URL (ou l'image de connexion par défaut)
  const image = images[pathname] ?? DeskConnection;

  return (
    <Image
      src={image}
      alt=""
      fill
      sizes="67vw"
      loading="eager"
      className="object-cover object-[100%_75%]"
    />
  );
}