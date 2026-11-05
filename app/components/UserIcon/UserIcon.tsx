import { getProfile } from "@/app/lib/api";
import { getInitials } from "@/app/lib/utils";
import UserMenu from "@/app/components/UserMenu/UserMenu";

// SERVER component: it fetches the profile, then passes the initials
// to the CLIENT component UserMenu, which handles opening the submenu.
export default async function UserIcon() {
  const response = await getProfile();

  if (!response.success) return null;

  const { user } = response.data;
  const initials = getInitials(user.name) || user.email.charAt(0).toUpperCase();

  return <UserMenu initials={initials} />;
}