import { db } from "@/db";
import {
  affiliates,
  affiliateOrders,
  affiliateCommissions,
  affiliateClicks,
  affiliateProductAssignments,
} from "@/db/schemas/affiliate.schema";
import { getProducts } from "@/lib/shopify/product.query";
import { createServerClient } from "@/lib/supabase/server-client";
import { eq, sum, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  Users,
  MousePointerClick,
  DollarSign,
  Package,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Heading from "@/components/ui/heading";
import StatCard from "@/components/ui/state-card";

export default async function AffiliateDashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  // Fetch their affiliate profile
  const profileRecord = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.userId, session.user.id));
  const profile = profileRecord[0];

  if (!profile) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
          You are not an affiliate
        </h2>
        <Link
          href="/affiliate/register"
          className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full"
        >
          Apply Now
        </Link>
      </div>
    );
  }

  if (profile.status === "pending") {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
          Application Pending
        </h2>
        <p className="text-black/60 font-medium">
          Your account is currently under review by our administration team.
        </p>
      </div>
    );
  }

  // Calculate high level metrics
  const clickCount = await db
    .select({ value: count() })
    .from(affiliateClicks)
    .where(eq(affiliateClicks.affiliateId, profile.id));
  const totalOrders = await db
    .select({ value: count() })
    .from(affiliateOrders)
    .where(eq(affiliateOrders.affiliateId, profile.id));

  // Commission Totals
  const pendingComm = await db
    .select({ value: sum(affiliateCommissions.amount) })
    .from(affiliateCommissions)
    .where(eq(affiliateCommissions.affiliateId, profile.id));

  // Assuming 'paid' sum calculation is similar but needs exact where clauses
  const allCommissions = await db
    .select()
    .from(affiliateCommissions)
    .where(eq(affiliateCommissions.affiliateId, profile.id));
  const paidCommVal = allCommissions
    .filter((c) => c.status === "paid")
    .reduce((a, b) => a + Number(b.amount), 0);

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}?ref=${profile.affiliateCode}`;

  return (
    <div className="space-x-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/10 pb-8">
        <Heading
          title="Affiliate Portal"
          description={`Welcome back, ${profile.name}. Your base commission is ${profile.defaultCommissionRate}%`}
        />
        {/* <div className="bg-black/5 p-4 rounded-xl space-y-2 max-w-md w-full">
          <p className="text-xs font-black uppercase tracking-widest text-black/40">Your Referral Link</p>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-black/10">
            <input type="text" readOnly value={referralLink} className="w-full bg-transparent text-sm font-mono text-black outline-none px-2" />
            <button className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase rounded-md shadow hover:bg-black/80">Copy</button>
          </div>
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clicks"
          value={clickCount[0].value.toString()}
          icon={<MousePointerClick className="w-5 h-5" />}
        />
        <StatCard
          title="Orders Generated"
          value={totalOrders[0].value.toString()}
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          title="Pending Payout"
          value={`$${(Number(pendingComm[0].value) || 0).toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
          className="bg-yellow-50 border-yellow-100 text-yellow-900"
        />
        <StatCard
          title="Total Paid"
          value={`$${paidCommVal.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
          className="bg-green-50 border-green-100 text-green-900"
        />
      </div>

      {/* Orders Table */}
      <div className="pt-8">
        <h2 className="text-lg font-black uppercase tracking-tight mb-4 border-l-4 border-black pl-3">
          Recent Referrals
        </h2>
        <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 text-xs uppercase tracking-widest font-black text-black/50">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {allCommissions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-black/40 font-medium"
                    >
                      No referrals generated yet. Start sharing your link!
                    </td>
                  </tr>
                )}
                {allCommissions.map((comm) => (
                  <tr
                    key={comm.id}
                    className="hover:bg-black/2 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs">
                      {comm.orderId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-black/60">
                      {new Date(comm.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      +${comm.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${comm.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {comm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
