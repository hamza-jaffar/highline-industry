function getEnvVariables() {
    const domain = process.env.SHOPIFY_STORE_DOMAIN
    const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

    if (!domain || !storefrontAccessToken) {
        throw new Error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variables');
    }

    return { domain, storefrontAccessToken };
}

export async function shopifyFetch(query: string, variables = {}, secure = false) {
    const { domain, storefrontAccessToken } = getEnvVariables();
    const url = `https://${domain}/api/2026-01/graphql.json`;

    // console.log(storefrontAccessToken);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": secure ? storefrontAccessToken : '',
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