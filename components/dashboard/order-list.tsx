"use client";

import Link from "next/link";
import { OrderStatusBadge } from "./order-status-badge";
import { ChevronRight, Package, Calendar, User } from "lucide-react";

interface Order {
  id: string;
  shopifyOrderNumber: string | null;
  totalPrice: number;
  status: string;
  createdAt: Date | null;
  customerName: string | null;
}

interface OrderListProps {
  orders: Order[];
  baseUrl: string; // e.g., /dashboard/user/orders or /dashboard/admin/orders
  showCustomer?: boolean;
}

export function OrderList({ orders, baseUrl, showCustomer = false }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
        <Package className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">No orders found</h3>
        <p className="text-gray-500">When orders are placed, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-premium">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-black/5">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
              {showCustomer && (
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
              )}
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Total</th>
              <th className="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {orders.map((order) => (
              <tr key={order.id} className="group hover:bg-black/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-900">
                    #{order.shopifyOrderNumber || order.id.slice(0, 8)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </div>
                </td>
                {showCustomer && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900 font-bold">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {order.customerName || "Guest"}
                    </div>
                  </td>
                )}
                <td className="px-6 py-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-black text-gray-900">
                    ${(order.totalPrice / 100).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 pr-4">
                  <Link
                    href={`${baseUrl}/${order.id}`}
                    className="p-2 hover:bg-black hover:text-white rounded-lg transition-all flex items-center justify-center text-gray-400"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
