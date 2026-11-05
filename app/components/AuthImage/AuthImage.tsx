"use client";

import Image, { type StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import DeskConnection from "@/public/image/desk-img.jpg";
import DeskRegister from "@/public/image/desk-register.jpg";

// Which image for which URL
const images: Record<string, StaticImageData> = {
  "/connection": DeskConnection,
  "/register": DeskRegister,
};

export default function AuthImage() {
  // The current URL, for example "/connection" or "/register"
  const pathname = usePathname();

  // The image matching the URL (or the login image by default)
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