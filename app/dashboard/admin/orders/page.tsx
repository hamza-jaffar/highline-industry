import { getAllOrders } from "@/app/actions/order.action";
import { OrderList } from "@/components/dashboard/order-list";
import Heading from "@/components/ui/heading";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <Heading
          title="Platform Orders"
          description="Manage, confirm, and complete customer orders across the entire platform."
        />
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
