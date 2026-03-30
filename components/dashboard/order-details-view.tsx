"use client";

import { OrderStatusBadge } from "./order-status-badge";
import {
  Package,
  Truck,
  User,
  Mail,
  MapPin,
  Hash,
  Calendar,
  DollarSign,
  Info,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { updateOrderStatus, cancelOrder } from "@/app/actions/order.action";
import RenderDesignPreview from "./order-item-design-preview";
import Link from "next/link";

interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  designId: string | null;
  quantity: number;
  price: number;
  isDesigned: boolean | null;
  productTitle: string | null;
  variantTitle: string | null;
  color: string | null;
  size: string | null;
}

interface Order {
  id: string;
  shopifyOrderNumber: string | null;
  shopifyOrderId: string | null;
  totalPrice: number;
  status: string;
  createdAt: Date | null;
  customerName: string | null;
  customerEmail: string | null;
  shippingAddress: string | null;
  items: OrderItem[];
}

interface OrderDetailsViewProps {
  order: Order;
  role: "user" | "admin" | "factory";
}

export default function OrderDetailsView({
  order,
  role,
}: OrderDetailsViewProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const shipping = order.shippingAddress
    ? JSON.parse(order.shippingAddress)
    : null;

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatus(order.id, newStatus);
      if (res.success) {
        toast.success(`Order marked as ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setIsUpdating(true);
    try {
      const res = await cancelOrder(order.id);
      if (res.success) {
        toast.success("Order cancelled successfully");
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-black/5 shadow-premium">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sora font-black tracking-tighter text-gray-900 uppercase">
              Order #{order.shopifyOrderNumber || order.id.slice(0, 8)}
            </h1>
            <OrderStatusBadge status={order.status} className="scale-110" />
          </div>
          <p className="text-sm font-bold text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true }) : "Unknown"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {role === "user" && order.status === "Pending" && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isUpdating}
              className="rounded-xl font-bold bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              Cancel Order
            </Button>
          )}

          {role === "admin" && (
            <div className="flex items-center gap-2">
              {order.status === "Pending" && (
                <Button
                  onClick={() => handleStatusUpdate("Confirmed")}
                  disabled={isUpdating}
                  className="rounded-xl font-bold bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20"
                >
                  Confirm Order
                </Button>
              )}
              {order.status === "Confirmed" && (
                <Button
                  onClick={() => handleStatusUpdate("Completed")}
                  disabled={isUpdating}
                  className="rounded-xl font-bold bg-green-600 text-white shadow-lg hover:shadow-green-500/20"
                >
                  Mark as Completed
                </Button>
              )}
              {order.status !== "Cancelled" && order.status !== "Completed" && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="rounded-xl font-bold border-gray-100 text-red-500 hover:bg-red-50"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Line Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-black/5 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-black/5 bg-gray-50/50 flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">
                Order Items
              </h2>
            </div>
            <div className="divide-y divide-black/5">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 transition-colors hover:bg-gray-50/30"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-black/5 relative">
                      {item.designId ? (
                        <RenderDesignPreview designId={item.designId} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-1">
                            {item.productTitle}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {item.color && (
                              <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 bg-gray-100 rounded text-gray-500">
                                {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 bg-gray-100 rounded text-gray-500">
                                {item.size}
                              </span>
                            )}
                            {item.isDesigned && (
                              <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 bg-green-50 rounded text-green-600 border border-green-100">
                                Customized
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-900">
                            ${(item.price / 100).toFixed(2)}
                          </p>
                          <p className="text-xs font-bold text-gray-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                          <Hash className="w-3 h-3" /> Variant: {item.variantId}
                        </div>
                        {item.designId && (
                          <Link
                            href={`/customizer/${order.items[0].productTitle?.toLowerCase().replace(/\s+/g, "-")}?designId=${item.designId}`}
                            className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1 hover:underline"
                          >
                            View Design <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50/50 border-t border-black/5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Total Order Amount
                </span>
                <span className="text-2xl font-black text-gray-900 font-sora">
                  ${(order.totalPrice / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Info & Customer */}
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-black/5 bg-gray-50/50 flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">
                Customer Details
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Name
                </p>
                <p className="text-sm font-black text-gray-900">
                  {order.customerName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </p>
                <p className="text-sm font-black text-gray-900">
                  {order.customerEmail || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-black/5 bg-gray-50/50 flex items-center gap-3">
              <Truck className="w-5 h-5 text-gray-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">
                Shipping To
              </h2>
            </div>
            <div className="p-6">
              {shipping ? (
                <div className="space-y-1 text-sm font-medium text-gray-600">
                  <p className="font-black text-gray-900 mb-2">
                    {shipping.name}
                  </p>
                  <p>{shipping.address1}</p>
                  {shipping.address2 && <p>{shipping.address2}</p>}
                  <p>
                    {shipping.city}, {shipping.province_code} {shipping.zip}
                  </p>
                  <p>{shipping.country}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                  <Info className="w-4 h-4" />
                  Address not provided
                </div>
              )}
            </div>
          </div>

          {/* Shopify Reference */}
          <div className="p-6 bg-linear-to-br from-indigo-50 to-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-blue-400 tracking-tighter">
                  Shopify Integration
                </p>
                <p className="text-sm font-black text-blue-900 tracking-tight">
                  Ref: {order.shopifyOrderId}
                </p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
