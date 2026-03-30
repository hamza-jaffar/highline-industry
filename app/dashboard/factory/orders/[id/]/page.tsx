import { getOrderWithItems } from "@/app/actions/order.action";
import OrderDetailsView from "@/components/dashboard/order-details-view";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Factory } from "lucide-react";

export default async function FactoryOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderWithItems(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
         <Link 
            href="/dashboard/factory/orders" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-xl text-xs font-black uppercase text-gray-400 hover:text-black hover:border-black/20 transition-all group shadow-sm"
         >
            <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Queue
         </Link>
         <div className="text-[10px] font-black uppercase tracking-widest text-orange-600 flex items-center gap-2">
            <Factory className="w-3.5 h-3.5" />
            Manufacturing View
         </div>
      </div>

      <OrderDetailsView order={order as any} role="factory" />
    </div>
  );
}
