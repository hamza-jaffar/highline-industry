import { getAllOrders } from "@/app/actions/order.action";
import { OrderList } from "@/components/dashboard/order-list";
import { Factory, Activity } from "lucide-react";

export default async function FactoryOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-orange-50 to-amber-50 border border-orange-100 text-xs font-semibold text-orange-900 tracking-wide mb-4 shadow-inner">
            <Factory className="w-3.5 h-3.5" />
            Manufacturing Queue
          </div>
          <h1 className="text-4xl font-sora font-black tracking-tighter text-transparent bg-linear-to-r from-black to-gray-800 bg-clip-text uppercase">
            Order Fulfillment
          </h1>
          <p className="text-muted text-base mt-2 max-w-md font-bold text-gray-400">
             Monitor current orders and access customization files for production.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-6 py-4 bg-white border border-black/5 rounded-2xl shadow-premium flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-gray-400">Queue Status</span>
                <span className="text-sm font-black text-gray-900 uppercase">Active Fulfillment</span>
             </div>
          </div>
        </div>
      </div>

      <OrderList 
        orders={orders.map(o => ({
            id: o.id,
            shopifyOrderNumber: o.shopifyOrderNumber,
            totalPrice: o.totalPrice,
            status: o.status,
            createdAt: o.createdAt,
            customerName: o.customerName
        }))} 
        baseUrl="/dashboard/factory/orders" 
        showCustomer={false}
      />
    </div>
  );
}
