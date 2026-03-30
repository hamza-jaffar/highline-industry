import { getUserOrders } from "@/app/actions/order.action";
import { OrderList } from "@/components/dashboard/order-list";
import { Package } from "lucide-react";

export default async function UserOrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-2">
         <div className="flex items-center gap-3">
            <div className="p-3 bg-black rounded-2xl shadow-lg">
               <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-sora font-black tracking-tighter text-gray-900 uppercase">My Orders</h1>
         </div>
         <p className="text-gray-500 font-bold ml-16">Track and manage your past and current purchases.</p>
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
        baseUrl="/dashboard/user/orders" 
      />
    </div>
  );
}
