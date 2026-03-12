"use server";

import { getProducts } from "@/lib/shopify/product.query";

export async function loadMoreProducts(
  collection: string | undefined,
  sortKey: string | undefined,
  reverse: boolean | undefined,
  after: string
) {
  try {
    const data = await getProducts({
      collection,
      sortKey,
      reverse,
      after,
      first: 12,
    });
    return data;
  } catch (error) {
    console.error("Failed to load more products:", error);
    return null;
  }
}
