import { db } from "@/db";
import {
  affiliates,
  affiliateOrders,
  affiliateCommissions,
} from "@/db/schemas/affiliate.schema";
import { createServerClient } from "@/lib/supabase/server-client";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Settings, Shield, UserCheck, AlertOctagon } from "lucide-react";
import {
  approveAffiliateAction,
  updateCommissionAction,
} from "@/app/actions/affiliate.action";
import Heading from "@/components/ui/heading";

export default async function AdminAffiliatesPage() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");
  // Assuming basic auth guard - you may want an admin check here

  // Fetch all affiliates
  const allAffiliates = await db
    .select()
    .from(affiliates)
    .orderBy(desc(affiliates.createdAt));

  return (
    <div className="space-y-8">
      <Heading
        title="Affiliate Network Management"
        description="Control commissions, approve applications, and audit revenue flow."
      />

      {/* Roster Database */}
      <section className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-black/5 p-6 border-b border-black/10 flex items-center justify-between">
          <h2 className="text-xs font-black text-black/60 uppercase tracking-widest">
            Network Roster ({allAffiliates.length})
          </h2>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/5 text-[10px] uppercase tracking-widest font-black text-black/40">
              <tr>
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4">Ref Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Base Rate</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {allAffiliates.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-black/40 font-medium"
                  >
                    No affiliates registered yet.
                  </td>
                </tr>
              )}
              {allAffiliates.map((aff) => (
                <tr
                  key={aff.id}
                  className={`hover:bg-black/2 transition-colors ${aff.status === "pending" ? "bg-yellow-50/50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-black">{aff.name}</p>
                    <p className="text-xs text-black/50">{aff.email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs tracking-wider">
                    {aff.affiliateCode}
                  </td>
                  <td className="px-6 py-4">
                    {aff.status === "pending" && (
                      <span className="px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    )}
                    {aff.status === "approved" && (
                      <span className="px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                    {aff.status === "suspended" && (
                      <span className="px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md bg-red-100 text-red-700">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {aff.defaultCommissionRate}%
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {aff.status === "pending" && (
                      <form
                        action={async (_formData: FormData) => {
                          "use server";
                          await approveAffiliateAction(aff.id);
                        }}
                        className="inline"
                      >
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase rounded shadow hover:bg-black/80"
                        >
                          Approve
                        </button>
                      </form>
                    )}
                    {aff.status === "approved" && (
                      <form
                        action={async (fd: FormData) => {
                          "use server";
                          const val = fd.get("margin") as string;
                          await updateCommissionAction(aff.id, val);
                        }}
                        className="inline-flex items-center gap-2"
                      >
                        <input
                          type="number"
                          name="margin"
                          defaultValue={parseFloat(
                            aff.defaultCommissionRate as string,
                          )}
                          className="w-16 px-2 py-1 text-xs border border-black/10 rounded focus:outline-none"
                        />
                        <span className="text-xs font-bold text-black/50">
                          %
                        </span>
                        <button
                          type="submit"
                          className="p-1.5 bg-black/5 text-black hover:bg-black/10 rounded"
                          title="Update Rate"
                        >
                          <Settings className="w-3 h-3" />
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
