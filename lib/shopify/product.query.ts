import { shopifyFetch } from "./shopify";

export type ShopifyProductEdge = {
  cursor: string;
  node: {
    id: string;
    title: string;
    handle: string;
    description: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    featuredImage: {
      url: string;
      altText: string;
    } | null;
    tags: string[];
  };
};

export type ShopifyProductsData = {
  edges: ShopifyProductEdge[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

import { getCollectionByHandle, getSubCollections } from "./collection.query";

/**
 * Fetches products from Shopify.
 * Supports filtering by collection handle, sorting, and pagination (after cursor).
 */
export async function getProducts({
  collection: collectionHandle,
  sortKey = "RELEVANCE",
  reverse = true,
  query: searchQuery,
  after,
  first = 12,
}: {
  collection?: string;
  sortKey?: string;
  reverse?: boolean;
  query?: string;
  after?: string;
  first?: number;
}): Promise<ShopifyProductsData> {
  let collectionId: string | null = null;
  let subCollectionIds: string[] = [];
  
  if (collectionHandle) {
    const mainCollection = await getCollectionByHandle(collectionHandle);
    if (mainCollection) {
      collectionId = mainCollection.id;
      // Also get sub-collections
      const subs = await getSubCollections(mainCollection.id);
      subCollectionIds = subs.map((s: any) => s.id);
    }
  }

  // Admin API products query doesn't allow 'collection(handle:...)' effectively.
  // We use the global 'products(query: ...)' which is very flexible.
  let gqlQuery = `
    query getProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $after: String, $query: String) {
      products(first: $first, sortKey: $sortKey, reverse: $reverse, after: $after, query: $query) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          cursor
          node {
            id
            title
            handle
            description
            tags
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  `;

  // Build the search query
  const searchParts = [];
  if (searchQuery) searchParts.push(searchQuery);
  
  if (collectionId) {
    if (subCollectionIds.length > 0) {
      const ids = [collectionId, ...subCollectionIds].map(id => `(collection_id:${id})`).join(" OR ");
      searchParts.push(`(${ids})`);
    } else {
      searchParts.push(`collection_id:${collectionId}`);
    }
  }

  const finalSearchQuery = searchParts.join(" ") || undefined;

  // Map sort keys
  let adminSortKey = sortKey;
  if (sortKey === "BEST_SELLING") adminSortKey = "RELEVANCE";
  if (sortKey === "PRICE") adminSortKey = "RELEVANCE"; 

  const variables = {
    first,
    sortKey: adminSortKey,
    reverse,
    after,
    query: finalSearchQuery,
  };

  const data = await shopifyFetch(gqlQuery, variables);
  
  const edges = data?.data?.products?.edges?.map((edge: any) => ({
    ...edge,
    node: {
      ...edge.node,
      priceRange: edge.node.priceRangeV2
    }
  })) || [];

  return { 
    edges, 
    pageInfo: data?.data?.products?.pageInfo || { hasNextPage: false, endCursor: null } 
  };
}

export async function getSingleProduct(handle: string) {
  const query = `
    query getProduct($query: String!) {
      products(first: 1, query: $query) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  inventoryQuantity
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            seo {
              title
              description
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { query: `handle:${handle}` });
  const node = data?.data?.products?.edges[0]?.node;
  if (!node) return null;

  return {
    ...node,
    priceRange: node.priceRangeV2
  };
}
