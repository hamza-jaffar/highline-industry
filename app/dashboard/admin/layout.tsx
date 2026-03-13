import { redirect } from "next/navigation";
import AdminLayout from "./AdminLayout";
import { createServerClient } from "@/lib/supabase/server-client";
import { getUserRole } from "@/lib/queries/userRole";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = await getUserRole(user.id);

  if (role !== "admin") redirect(`/dashboard/${role}`);
  return <AdminLayout>{children}</AdminLayout>;
}
