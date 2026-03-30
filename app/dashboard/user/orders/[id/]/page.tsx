import { getOrderWithItems } from "@/app/actions/order.action";
import OrderDetailsView from "@/components/dashboard/order-details-view";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function UserOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderWithItems(params.id);

  if (!order) {
    notFound();
  }

  // TODO: Add proper authorization check to ensure the user owns this order

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <Link 
        href="/dashboard/user/orders" 
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-xl text-xs font-black uppercase text-gray-400 hover:text-black hover:border-black/20 transition-all group"
      >
        <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        Back to Orders
      </Link>

      <OrderDetailsView order={order as any} role="user" />
    </div>
  );
}
