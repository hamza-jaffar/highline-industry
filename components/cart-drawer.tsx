"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setCartOpen, setCartData } from "@/lib/store/cartSlice";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2 } from "lucide-react";
import { getCartAction, removeCartItemAction, updateCartItemQuantityAction } from "@/app/actions/cart.action";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const { isOpen, data: cart } = useAppSelector((state) => state.cart);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshCart();
    }
  }, [isOpen]);

  const refreshCart = async () => {
    setIsLoading(true);
    const result = await getCartAction();
    if (result.success) {
      dispatch(setCartData(result.cart));
    }
    setIsLoading(false);
  };

  const handleRemoveItem = async (lineId: string) => {
    setIsRemoving(lineId);
    const result = await removeCartItemAction([lineId]);
    if (result.success) {
      dispatch(setCartData(result.cart));
      toast.success("Item removed from cart");
    } else {
      toast.error(result.error || "Failed to remove item");
    }
    setIsRemoving(null);
  };

  const handleUpdateQuantity = async (lineId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(lineId);
      return;
    }
    setIsUpdating(lineId);
    const result = await updateCartItemQuantityAction(lineId, newQuantity);
    if (result.success) {
      dispatch(setCartData(result.cart));
    } else {
      toast.error(result.error || "Failed to update quantity");
    }
    setIsUpdating(null);
  };

  if (!isOpen) return null;

  const cartLines = cart?.lines?.edges || [];
  const subtotal = cart?.cost?.subtotalAmount;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={() => dispatch(setCartOpen(false))}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-black" />
            <h2 className="text-xl font-black uppercase tracking-widest font-sora">Your bag</h2>
            {cartLines.length > 0 && (
              <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {cartLines.length}
              </span>
            )}
          </div>
          <button
            onClick={() => dispatch(setCartOpen(false))}
            className="p-2 hover:bg-black/5 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-6 h-6 text-black/40" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          {isLoading && !cart ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-black/20" />
              <p className="text-xs font-black uppercase tracking-widest text-black/40">Loading your bag...</p>
            </div>
          ) : cartLines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6">
              <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-black/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-tight">Your bag is empty</h3>
                <p className="text-sm text-black/40 font-medium max-w-[200px]">Looks like you haven't added anything yet.</p>
              </div>
              <button
                onClick={() => dispatch(setCartOpen(false))}
                className="px-8 py-3 bg-black text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-black/80 transition-all active:scale-95"
              >
                Start Shoping
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {cartLines.map(({ node: item }: any) => {
                const designId = item.attributes?.find((a: any) => a.key === "_design_id")?.value;
                const color = item.attributes?.find((a: any) => a.key === "Color")?.value;
                const size = item.attributes?.find((a: any) => a.key === "Size")?.value;

                return (
                  <div key={item.id} className="flex gap-6 group">
                    {/* Item Image */}
                    <div className="relative w-24 h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-black/5">
                      {/* We'd normally have a product image here, using placeholder for now if missing */}
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase text-black/20">
                        Item
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm uppercase tracking-tight leading-tight group-hover:text-black transition-colors">
                            {item.merchandise.product.title}
                          </h4>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isRemoving === item.id}
                            className="p-1 hover:text-red-600 cursor-pointer text-red-500 transition-colors"
                          >
                            {isRemoving === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
                          {color && `${color} / `}{size && `${size}`}
                        </p>
                        {designId && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-green-50 text-[9px] font-black text-green-600 uppercase tracking-tighter rounded border border-green-100">
                            Custom Design
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4">
                        <div className="flex items-center bg-gray-50 border border-black/5 rounded-full p-1 self-start">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={isUpdating === item.id}
                            className="w-7 h-7 flex items-center justify-center text-black/40 hover:text-black hover:bg-white rounded-full transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <div className="px-3 min-w-[2.5rem] text-center">
                            {isUpdating === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin mx-auto text-black" />
                            ) : (
                              <span className="text-xs font-black font-sora">{item.quantity}</span>
                            )}
                          </div>

                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating === item.id}
                            className="w-7 h-7 flex items-center justify-center text-black/40 hover:text-black hover:bg-white rounded-full transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-black tracking-tight font-sora">
                          {subtotal?.currencyCode} {parseFloat(item.cost?.totalAmount?.amount || "0").toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartLines.length > 0 && (
          <div className="px-8 py-8 border-t border-black/5 bg-gray-50/50 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-black/40 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>{subtotal?.currencyCode} {subtotal?.amount}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-black/40 uppercase tracking-widest">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="pt-4 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest">Total</span>
                <span className="text-xl font-bold">{subtotal?.currencyCode} {subtotal?.amount}</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={cart?.checkoutUrl}
                className="w-full flex items-center justify-between bg-black text-white px-8 py-5 rounded-lg text-xs font-semibold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all active:scale-[0.98] shadow-xl shadow-black/10 group"
              >
                <span>Checkout Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <button
                onClick={() => dispatch(setCartOpen(false))}
                className="w-full py-4 cursor-pointers text-[10px] font-black text-black/40 uppercase tracking-widest hover:text-black transition-colors"
              >
                Continue Shoping
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
