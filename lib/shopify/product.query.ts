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

/**
 * Fetches products from Shopify.
 * Supports filtering by collection handle, sorting, and pagination (after cursor).
 */
export async function getProducts({
  collection,
  sortKey = "CREATED_AT",
  reverse = true,
  after,
  first = 12,
}: {
  collection?: string;
  sortKey?: string;
  reverse?: boolean;
  after?: string;
  first?: number;
}): Promise<ShopifyProductsData> {
  let query = "";
  let variables = {};

  if (collection) {
    // Fetch products within a specific collection
    query = `
      query getCollectionProducts($handle: String!, $first: Int!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $after: String) {
        collection(handle: $handle) {
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
                priceRange {
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
    variables = {
      handle: collection,
      first,
      sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
      reverse,
      after,
    };
  } else {
    // Fetch all products
    query = `
      query getProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $after: String) {
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
              priceRange {
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
    variables = {
      first,
      sortKey,
      reverse,
      after,
    };
  }

  const data = await shopifyFetch(query, variables);

  if (collection) {
    return data?.data?.collection?.products || { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };
  } else {
    return data?.data?.products || { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }
}

export async function getSingleProduct(handle: string) {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
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
        priceRange {
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
              availableForSale
              price {
                amount
                currencyCode
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
  `;

  const data = await shopifyFetch(query, { handle });
  return data?.data?.product;
}
