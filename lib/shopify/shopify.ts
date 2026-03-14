function getEnvVariables() {
    const domain = process.env.SHOPIFY_STORE_DOMAIN
    const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
    const adminAccessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN

    if (!domain || !storefrontAccessToken || !adminAccessToken) {
        throw new Error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variables');
    }

    return { domain, storefrontAccessToken, adminAccessToken };
}

export async function shopifyFetch(query: string, variables = {}, secure = true) {
    const { domain, storefrontAccessToken, adminAccessToken } = getEnvVariables();
    const url = `https://${domain}/admin/api/2026-01/graphql.json`;

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
        console.error("Shopify GraphQL Error:", JSON.stringify(json.errors, null, 2));
        throw new Error(`Shopify query failed: ${json.errors[0]?.message || 'Unknown error'}`);
    }

    return json;
}