import { auth } from "@/lib/auth";
import HeaderClient from "@/components/layout/HeaderClient";

/**
 * Header (Server Component): membaca sesi perrenderan,
 * lalu meneruskan data user ke sisi client untuk interaksi (dropdown).
 */
export default async function Header() {
  const session = await auth();

  const user = session?.user
    ? {
        name: session.user.name,
        image: session.user.image,
        username: session.user.username,
        role: session.user.role,
      }
    : null;

  return <HeaderClient user={user} />;
}
