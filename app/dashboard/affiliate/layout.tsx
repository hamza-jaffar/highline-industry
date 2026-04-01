import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createServerClient } from "@/lib/supabase/server-client";
import { getUserRole } from "@/lib/queries/userRole";

export default async function AffiliateLayout({
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

  // If they are admin, they can see this too, but normally they should be 'affiliate'
  if (role !== "affiliate" && role !== "admin") {
    redirect(`/dashboard/${role}`);
  }

  return (
    <DashboardShell role="affiliate" user={user}>
      {children}
    </DashboardShell>
  );
}
