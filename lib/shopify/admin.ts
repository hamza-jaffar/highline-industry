
export async function adminShopifyFetch(query: string, variables = {}) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminAccessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

  if (!domain || !adminAccessToken) {
    throw new Error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_API_ACCESS_TOKEN');
  }

  const url = `https://${domain}/admin/api/2024-10/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminAccessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store"
  });

  const json = await response.json();

  if (json.errors) {
    console.error("Shopify Admin GraphQL Error:", JSON.stringify(json.errors, null, 2));
    throw new Error(`Shopify Admin query failed: ${json.errors[0]?.message || 'Unknown error'}`);
  }

  return json;
}

export async function getPrimaryLocationId() {
  const query = `
      query {
        locations(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;
  const result = await adminShopifyFetch(query);
  return result.data.locations.edges[0]?.node?.id;
}
