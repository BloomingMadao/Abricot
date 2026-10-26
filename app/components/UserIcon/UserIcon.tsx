import { getProfile } from "@/app/lib/api";
import { getInitials } from "@/app/lib/utils";
import UserMenu from "@/app/components/UserMenu/UserMenu";

// Composant SERVEUR : il récupère le profil, puis passe les initiales
// au composant CLIENT UserMenu qui gère l'ouverture du sous-menu.
export default async function UserIcon() {
  const response = await getProfile();

  if (!response.success) return null;

  const { user } = response.data;
  const initials = getInitials(user.name) || user.email.charAt(0).toUpperCase();

  return <UserMenu initials={initials} />;
}