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
    const { domain, adminAccessToken } = getEnvVariables();
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

export async function storefrontFetch(query: string, variables = {}) {
    const { domain, storefrontAccessToken } = getEnvVariables();
    const url = `https://${domain}/api/2024-04/graphql.json`;

    console.log(`[Storefront API] Fetching from: ${url}`);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        },
        body: JSON.stringify({ query, variables }),
        cache: "no-store"
    });

    const json = await response.json();

    if (json.errors) {
        console.error("Shopify Storefront GraphQL Error:", JSON.stringify(json.errors, null, 2));
        throw new Error(`Shopify storefront query failed: ${json.errors[0]?.message || 'Unknown error'}`);
    }

    return json;
}