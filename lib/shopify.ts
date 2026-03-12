function getEnvVariables() {
    const domain = process.env.SHOPIFY_STORE_DOMAIN
    const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

    if (!domain || !storefrontAccessToken) {
        throw new Error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variables');
    }

    return { domain, storefrontAccessToken };
}

export async function shopifyFetch(query: string, variables = {}) {
    const { domain, storefrontAccessToken } = getEnvVariables();
    const response = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        },
        body: JSON.stringify({ query, variables }),
    })

    return response.json()
}