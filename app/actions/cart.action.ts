"use server";

import { cookies } from "next/headers";
import { createCart, addToCart, getCart, removeFromCart as shopifyRemoveFromCart, updateCartLines as shopifyUpdateCartLines } from "@/lib/shopify/cart";
import { db } from "@/db";
import { cartItems, userDesigns } from "@/db/schemas/product-customization.schema";
import { createServerClient } from "@/lib/supabase/server-client";
import { eq, and, inArray } from "drizzle-orm";
import { getSingleProduct } from "@/lib/shopify/product.query";

const CART_ID_COOKIE = "shopify_cart_id";

export async function addItemToCart(params: {
  productId: string;
  variantId: string;
  quantity: number;
  designId?: string;
  isDesigned: boolean;
  price: number; // in cents or dollars, let's use cents for Supabase
  color?: string;
  size?: string;
}) {
  try {
    const cookieStore = await cookies();
    let cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    // 1. Prepare Shopify Line Item Attributes
    const attributes = [];
    if (params.isDesigned && params.designId) {
      attributes.push({ key: "_design_id", value: params.designId });
    }
    if (params.color) attributes.push({ key: "Color", value: params.color });
    if (params.size) attributes.push({ key: "Size", value: params.size });

    const line = {
      variantId: params.variantId,
      quantity: params.quantity,
      price: (params.price / 100).toFixed(2), // Pass as string "XX.XX"
      attributes: attributes.length > 0 ? attributes : undefined,
    };

    // 2. Add to Shopify (Create if missing, else Add)
    let shopifyResult;
    if (!cartId) {
      const cart = await createCart([line]);
      if (!cart || !cart.id) throw new Error("Failed to create Shopify cart");
      const newCartId: string = cart.id;
      cartId = newCartId;
      cookieStore.set(CART_ID_COOKIE, newCartId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      shopifyResult = { success: true, cart: cart, userErrors: [] };
    } else {
      shopifyResult = await addToCart(cartId, [line]);
    }

    if (shopifyResult.userErrors && shopifyResult.userErrors.length > 0) {
      return { success: false, error: shopifyResult.userErrors[0].message };
    }

    // 3. Track in Supabase cart_items
    await db.insert(cartItems).values({
      userId: userId as any,
      shopifyCartId: cartId,
      productId: params.productId,
      variantId: params.variantId,
      quantity: params.quantity,
      designId: params.designId as any,
      isDesigned: params.isDesigned,
      price: params.price,
      color: params.color,
      size: params.size,
    });

    return { 
      success: true, 
      cartId, 
      checkoutUrl: shopifyResult.cart?.checkoutUrl 
    };

  } catch (error: any) {
    console.error("Error in addItemToCart:", error);
    return { success: false, error: error.message || "Failed to add item to cart" };
  }
}

export async function getVariantIdByOptions(handle: string, color: string, size: string) {
    const product = await getSingleProduct(handle);
    if (!product) return null;

    const variant = product.variants.edges.find(({ node }: any) => {
        const hasColor = node.selectedOptions.some((o: any) => o.name.toLowerCase() === "color" && o.value === color);
        const hasSize = node.selectedOptions.some((o: any) => o.name.toLowerCase() === "size" && o.value === size);
        return hasColor && hasSize;
    });

    return variant?.node.id || null;
}

export async function getCartAction() {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    if (!cartId) return { success: true, cart: null };

    const cart = await getCart(cartId);
    return { success: true, cart };

  } catch (error: any) {
    console.error("Error in getCartAction:", error);
    return { success: false, error: error.message };
  }
}

export async function removeCartItemAction(lineIds: string[]) {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    if (!cartId) throw new Error("No cart found");

    const result = await shopifyRemoveFromCart(cartId, lineIds);
    
    if (result.userErrors && result.userErrors.length > 0) {
      return { success: false, error: result.userErrors[0].message };
    }

    return { success: true, cart: result.cart };

  } catch (error: any) {
    console.error("Error in removeCartItemAction:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCartItemQuantityAction(lineId: string, quantity: number) {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    if (!cartId) throw new Error("No cart found");
    if (quantity < 1) return removeCartItemAction([lineId]);

    const result = await shopifyUpdateCartLines(cartId, [{ id: lineId, quantity }]);
    
    if (result.userErrors && result.userErrors.length > 0) {
      return { success: false, error: result.userErrors[0].message };
    }

    return { success: true, cart: result.cart };

  } catch (error: any) {
    console.error("Error in updateCartItemQuantityAction:", error);
    return { success: false, error: error.message };
  }
}
