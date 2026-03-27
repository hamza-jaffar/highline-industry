import { redirect } from "next/navigation";
import FactoryLayout from "./factory-layout";
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

  if (role !== "factory") redirect(`/dashboard/${role}`);

  return <FactoryLayout>{children}</FactoryLayout>;
}
