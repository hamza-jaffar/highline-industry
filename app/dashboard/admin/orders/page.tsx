import { getAllOrders } from "@/app/actions/order.action";
import { OrderList } from "@/components/dashboard/order-list";
import { Shield, Package } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-black/10 to-gray-100 border border-black/10 text-xs font-semibold text-black tracking-wide mb-4 shadow-inner">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            Order Management System
          </div>
          <h1 className="text-4xl font-sora font-black tracking-tighter text-transparent bg-linear-to-r from-black to-gray-800 bg-clip-text uppercase">
            Platform Orders
          </h1>
          <p className="text-muted text-base mt-2 max-w-md font-bold text-gray-400">
             Manage, confirm, and complete customer orders across the entire platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-6 py-4 bg-white border border-black/5 rounded-2xl shadow-premium">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-gray-400">Total Volume</span>
                <span className="text-xl font-black text-gray-900">${(orders.reduce((sum, o) => sum + o.totalPrice, 0) / 100).toLocaleString()}</span>
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
        baseUrl="/dashboard/admin/orders" 
        showCustomer={true}
      />
    </div>
  );
}
