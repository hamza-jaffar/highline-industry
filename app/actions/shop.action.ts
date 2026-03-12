"use server";

import { getProducts } from "@/lib/shopify/product.query";

export async function loadMoreProducts(
  collection: string | undefined,
  sortKey: string | undefined,
  reverse: boolean | undefined,
  query: string | undefined,
  after: string
) {
  try {
    const data = await getProducts({
      collection,
      sortKey,
      reverse,
      query,
      after,
      first: 12,
    });
    return data;
  } catch (error) {
    console.error("Failed to load more products:", error);
    return null;
  }
}
