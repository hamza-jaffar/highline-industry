"use server";

// Shopify Admin Actions for Product and Collection Management

import { adminShopifyFetch, getPrimaryLocationId } from "@/lib/shopify/admin";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: any, id?: string) {
  const mutation = `
    mutation productSet($input: ProductSetInput!) {
      productSet(input: $input) {
        product {
          id
          title
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const locationId = await getPrimaryLocationId();
    if (!locationId) {
      return { success: false, error: "Primary location ID not found. Please check your Shopify settings." };
    }

    // Map options to ProductOptionSetInput
    const productOptions = formData.options.map((optionName: string) => {
      // Collect all unique values for this option across all variants
      const values = Array.from(new Set(formData.variants.map((v: any) => {
        const opt = v.options.find((o: any) => o.name === optionName);
        return opt ? opt.value : "";
      }))).filter(v => v !== "").map(valueName => ({ name: valueName }));

      return {
        name: optionName,
        values: values
      };
    });

    const variables = {
      input: {
        id: id, // If ID is provided, it updates the existing product
        title: formData.title,
        descriptionHtml: formData.description,
        vendor: "Highline Industry",
        productType: formData.category,
        productOptions: productOptions,
        variants: formData.variants.map((v: any) => ({
          price: v.price,
          sku: v.sku,
          inventoryQuantities: [
            {
              name: "available",
              quantity: parseInt(v.quantity),
              locationId: locationId
            }
          ],
          optionValues: v.options.map((opt: any) => ({
            optionName: opt.name,
            name: opt.value
          }))
        }))
      }
    };

    const result = await adminShopifyFetch(mutation, variables);
    const data = result.data.productSet;

    if (data.userErrors.length > 0) {
      return { success: false, errors: data.userErrors };
    }

    revalidatePath("/shop");
    revalidatePath("/dashboard/admin/products");
    if (id) revalidatePath(`/dashboard/admin/products/${id.split('/').pop()}`);
    
    return { success: true, product: data.product };
  } catch (error: any) {
    console.error("Error saving product:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminProduct(id: string) {
  const query = `
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        handle
        descriptionHtml
        status
        vendor
        productType
        featuredImage {
          url
          altText
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
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
        options {
          name
          values
        }
      }
    }
  `;

  try {
    const result = await adminShopifyFetch(query, { id });
    return { success: true, data: result.data.product };
  } catch (error: any) {
    console.error("Error fetching admin product:", error);
    return { success: false, error: error.message };
  }
}

export async function createCollection(title: string, handle?: string) {
  const mutation = `
    mutation collectionCreate($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
          title
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const variables = {
      input: {
        title,
        handle
      }
    };

    const result = await adminShopifyFetch(mutation, variables);
    const data = result.data.collectionCreate;

    if (data.userErrors.length > 0) {
      return { success: false, errors: data.userErrors };
    }

    revalidatePath("/shop");
    return { success: true, collection: data.collection };
  } catch (error: any) {
    console.error("Error creating collection:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminProducts(first = 10, after?: string) {
  const query = `
    query getAdminProducts($first: Int!, $after: String) {
      products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        edges {
          cursor
          node {
            id
            title
            handle
            status
            totalInventory
            featuredImage {
              url
              altText
            }
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  try {
    const result = await adminShopifyFetch(query, { first, after });
    return { success: true, data: result.data.products };
  } catch (error: any) {
    console.error("Error fetching admin products:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminCollections(first = 10, after?: string) {
  const query = `
    query getAdminCollections($first: Int!, $after: String) {
      collections(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        edges {
          cursor
          node {
            id
            title
            handle
            productsCount {
              count
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;

  try {
    const result = await adminShopifyFetch(query, { first, after });
    return { success: true, data: result.data.collections };
  } catch (error: any) {
    console.error("Error fetching admin collections:", error);
    return { success: false, error: error.message };
  }
}
