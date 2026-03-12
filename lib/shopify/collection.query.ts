import { shopifyFetch } from "./shopify";

export async function getCollections() {
    const query = `
        {collections(first: 10) {
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
            }
          }
        }}
      
    `;

    const data = await shopifyFetch(query);

    return data?.data?.collections?.edges?.map((edge: any) => edge.node);
}