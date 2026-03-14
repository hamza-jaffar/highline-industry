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
  reverse = false,
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
  // Map sort keys to Admin API equivalents
  let adminSortKey = sortKey;
  if (sortKey === "BEST_SELLING") adminSortKey = "BEST_SELLING";
  if (sortKey === "PRICE") adminSortKey = "PRICE";
  if (sortKey === "CREATED_AT") adminSortKey = "CREATED_AT";

  if (collectionHandle) {
    // Resolve the collection GID
    const mainCollection = await getCollectionByHandle(collectionHandle);
    if (!mainCollection) {
      return { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };
    }

    const collectionId = mainCollection.id;

    // Fetch products directly via collection connection — the correct Admin API approach
    const gqlQuery = `
      query getCollectionProducts(
        $id: ID!,
        $first: Int!,
        $sortKey: ProductCollectionSortKeys,
        $reverse: Boolean,
        $after: String
      ) {
        collection(id: $id) {
          products(first: $first, sortKey: $sortKey, reverse: $reverse, after: $after) {
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
      }
    `;

    // ProductCollectionSortKeys supported values
    const collectionSortKeyMap: Record<string, string> = {
      RELEVANCE: "MANUAL",
      CREATED_AT: "CREATED",
      PRICE: "PRICE",
      BEST_SELLING: "BEST_SELLING",
      TITLE: "TITLE",
    };
    const collectionSortKey = collectionSortKeyMap[adminSortKey] || "MANUAL";

    const variables = {
      id: collectionId,
      first,
      sortKey: collectionSortKey,
      reverse,
      after,
    };

    const data = await shopifyFetch(gqlQuery, variables);
    const productsData = data?.data?.collection?.products;

    if (!productsData) {
      return { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };
    }

    // Filter by search query client-side if provided (collection products don't support text search)
    let edges = productsData.edges.map((edge: any) => ({
      ...edge,
      node: {
        ...edge.node,
        priceRange: edge.node.priceRangeV2,
      },
    }));

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      edges = edges.filter((e: any) =>
        e.node.title.toLowerCase().includes(lower) ||
        e.node.description.toLowerCase().includes(lower) ||
        e.node.tags?.some((t: string) => t.toLowerCase().includes(lower))
      );
    }

    return {
      edges,
      pageInfo: productsData.pageInfo || { hasNextPage: false, endCursor: null },
    };
  }

  // --- No collection: global products listing ---
  const gqlQuery = `
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

  // Safety: RELEVANCE + reverse: true often breaks things
  let finalReverse = reverse;
  if (adminSortKey === "RELEVANCE") finalReverse = false;

  const variables = {
    first,
    sortKey: adminSortKey,
    reverse: finalReverse,
    after,
    query: searchQuery || undefined,
  };

  const data = await shopifyFetch(gqlQuery, variables);

  const edges = data?.data?.products?.edges?.map((edge: any) => ({
    ...edge,
    node: {
      ...edge.node,
      priceRange: edge.node.priceRangeV2,
    },
  })) || [];

  return {
    edges,
    pageInfo: data?.data?.products?.pageInfo || { hasNextPage: false, endCursor: null },
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
                  image {
                    url
                    altText
                  }
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
