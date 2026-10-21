import Link from "next/link";
import { getProfile } from "@/app/lib/api";
import { getInitials } from "@/app/lib/utils";

export default async function UserIcon(){

const response = await getProfile();

if (!response.success) return null;

const { user } = response.data;
const initials = getInitials(user.name) || user.email.charAt(0).toUpperCase();

  return (
    <Link
      href="/profile"
      aria-label="Mon compte"
      className="flex items-center justify-center size-[65px] rounded-full bg-(--brand-color-light) text-black font-(--font-sans) focus:text-white focus:bg-(--brand-color-dark)"
    >
      {initials}
    </Link>
  );
}