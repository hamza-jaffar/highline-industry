import { shopifyFetch } from "./shopify";

export async function getCollections() {
  const query = `
    {
      collections(first: 50) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
            metafield(namespace: "custom", key: "parent_collection_id") {
              value
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query);
  return data?.data?.collections?.edges?.map((edge: any) => edge.node) || [];
}

export async function getCollectionByHandle(handle: string) {
  // In Admin API, we use a query to finding a collection by handle
  const query = `
    query getCollection($queryString: String!) {
      collections(first: 1, query: $queryString) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
            metafield(namespace: "custom", key: "parent_collection_id") {
              value
            }
          }
        }
      }
    }
  `;

  const variables = { queryString: `handle:${handle}` };
  const data = await shopifyFetch(query, variables);
  return data?.data?.collections?.edges[0]?.node || null;
}

export async function getSubCollections(parentId: string) {
  // Since we can't easily query metafields in a list in Admin API without search, 
  // we fetch all and filter, or use the handle approach if we have many collections.
  // For now, fetching all and filtering is safer for smaller catalogs.
  const all = await getCollections();
  return all.filter((c: any) => c.metafield?.value === parentId);
}