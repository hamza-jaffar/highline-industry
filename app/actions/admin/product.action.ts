"use server";

import { adminShopifyFetch, getPrimaryLocationId } from "@/lib/shopify/admin";
import { revalidatePath } from "next/cache";
import { getStagedUploadUrl } from "./utils";

export async function saveProduct(formData: any, id?: string) {
  const mutation = `
    mutation productSet($input: ProductSetInput!) {
      productSet(input: $input) {
        product {
          id
          title
          handle
          media(first: 250) {
            edges {
              node {
                ... on MediaImage {
                  id
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
          variants(first: 250) {
            edges {
              node {
                id
                selectedOptions {
                  name
                  value
                }
                media(first: 1) {
                  edges {
                    node {
                      ... on MediaImage {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
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

    const imageInputs: Array<{ alt: string; contentType: string; originalSource: string }> = [];
    const variantImageAlt: Record<number, string> = {};
    const variantImageId: Record<number, string> = {};

    const addImageInput = (imageSrc: string, altText: string) => {
      if (!imageSrc) return;
      imageInputs.push({ alt: altText, contentType: "IMAGE", originalSource: imageSrc });
    };

    const uploadLocalImage = async (image: any, altText: string): Promise<string | null> => {
      if (!image?.base64 || !image?.type || !image?.name) return null;

      const extension = image.name.split('.').pop();
      const sanitizedBase = image.name
        .split('.')[0]
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      const uniqueFilename = `${sanitizedBase}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;

      const staged = await getStagedUploadUrl(uniqueFilename, image.type);
      if (!staged.success) return null;

      const { url, parameters, resourceUrl } = staged.target;
      const uploadFormData = new FormData();
      parameters.forEach((p: any) => uploadFormData.append(p.name, p.value));

      const buffer = Buffer.from(image.base64, 'base64');
      const blob = new Blob([buffer], { type: image.type });
      uploadFormData.append("file", blob, uniqueFilename);

      const uploadResult = await fetch(url, { method: "POST", body: uploadFormData });
      if (!uploadResult.ok) return null;

      addImageInput(resourceUrl, altText);
      return resourceUrl;
    };

    if (formData.images && formData.images.length > 0) {
      for (const image of formData.images) {
        const altText = image.altText || formData.title || "Product image";
        if (image.base64 && image.type && image.name) {
          await uploadLocalImage(image, altText);
        } else if (image.url) {
          addImageInput(image.url, altText);
        }
      }
    }

    const variantImageUrls: Record<number, string> = {};
    const variantImageKeys: Record<number, string> = {};

    if (formData.variants && formData.variants.length > 0) {
      for (let i = 0; i < formData.variants.length; i++) {
        const variant = formData.variants[i];
        if (!variant.image) continue;

        if (variant.image.id) {
          variantImageId[i] = variant.image.id;
          continue;
        }

        const imageKey = variant.image.imageKey || `variant-${i}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        variantImageKeys[i] = imageKey;

        const altText = variant.image.altText || imageKey;
        variantImageAlt[i] = altText;

        if (variant.image.base64 && variant.image.type && variant.image.name) {
          const uploadedUrl = await uploadLocalImage(variant.image, imageKey);
          if (uploadedUrl) {
            variantImageUrls[i] = uploadedUrl;
            variant.image.url = uploadedUrl;
            variant.image.altText = imageKey;
          }
        } else if (variant.image.url) {
          addImageInput(variant.image.url, imageKey);
          variantImageUrls[i] = variant.image.url;
          variant.image.altText = imageKey;
        }
      }
    }

    const productOptions = formData.options.map((optionName: string) => {
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
        id: id,
        title: formData.title,
        descriptionHtml: formData.description,
        vendor: formData.vendor || "Highline Industry",
        productType: formData.category,
        status: formData.status || "ACTIVE",
        productOptions: productOptions,
        files: imageInputs,
        collections: formData.collections || [],
        variants: formData.variants.map((v: any, index: number) => ({
          id: v.id,
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

    if (data.userErrors && data.userErrors.length > 0) {
      return { success: false, error: data.userErrors.map((e: any) => e.message).join(", ") };
    }

    const productImageMapByAlt: Record<string, string> = {};
    const productImageMapByUrl: Record<string, string> = {};
    (data.product.media?.edges || []).forEach((edge: any) => {
      if (!edge?.node) return;
      const node = edge.node;
      if (node.image?.altText) productImageMapByAlt[node.image.altText] = node.id;
      if (node.image?.url) productImageMapByUrl[node.image.url] = node.id;
    });

    const variantImageAssignments: Array<{ variantId: string; mediaIds: string[] }> = [];
    const productVariants = (data.product.variants?.edges || []).map((edge: any) => edge.node);
    const variantDetachAssignments: Array<{ variantId: string; mediaIds: string[] }> = [];

    for (let i = 0; i < (formData.variants || []).length; i++) {
      const variant = formData.variants[i];
      if (!variant || !variant.image) continue;

      let setImageId = variantImageId[i] || "";
      if (!setImageId && variantImageKeys[i]) {
        setImageId = productImageMapByAlt[variantImageKeys[i]] || "";
      }
      if (!setImageId && variantImageAlt[i]) {
        setImageId = productImageMapByAlt[variantImageAlt[i]] || "";
      }
      if (!setImageId && variantImageUrls[i]) {
        setImageId = productImageMapByUrl[variantImageUrls[i]] || "";
      }
      if (!setImageId && variant.image.url) {
        setImageId = productImageMapByUrl[variant.image.url] || "";
      }
      if (!setImageId) {
        console.warn(`Could not find uploaded image ID for variant at index ${i}. Available Alt Texts:`, Object.keys(productImageMapByAlt));
        continue;
      }

      let variantId = variant.id;
      if (!variantId) {
        const matching = productVariants.find((pv: any) =>
          variant.options.every((opt: any) =>
            pv.selectedOptions?.some((popt: any) => popt.name === opt.name && popt.value === opt.value)
          )
        );
        variantId = matching?.id;
      }

      if (variantId) {
        variantImageAssignments.push({ variantId, mediaIds: [setImageId] });

        const matchedVariant = productVariants.find((pv: any) => pv.id === variantId);
        let existingMediaId = null;
        if (matchedVariant?.media?.edges?.[0]?.node?.id) {
          existingMediaId = matchedVariant.media.edges[0].node.id;
        }

        if (existingMediaId && existingMediaId !== setImageId) {
          variantDetachAssignments.push({ variantId, mediaIds: [existingMediaId] });
        }
      }
    }

    if (variantDetachAssignments.length > 0) {
      const variantDetachMediaMutation = `
        mutation productVariantDetachMedia($productId: ID!, $variantMedia: [ProductVariantDetachMediaInput!]!) {
          productVariantDetachMedia(productId: $productId, variantMedia: $variantMedia) {
            product {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const detachResult = await adminShopifyFetch(variantDetachMediaMutation, {
        productId: data.product.id,
        variantMedia: variantDetachAssignments
      });

      const detachErrors = detachResult?.data?.productVariantDetachMedia?.userErrors;
      if (detachErrors && detachErrors.length > 0) {
        console.warn("Error detaching media:", detachErrors.map((e: any) => e.message).join(', '));
      }
    }

    if (variantImageAssignments.length > 0) {
      const variantAppendMediaMutation = `
        mutation productVariantAppendMedia($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
          productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
            product {
              id
            }
            productVariants {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variantResult = await adminShopifyFetch(variantAppendMediaMutation, {
        productId: data.product.id,
        variantMedia: variantImageAssignments
      });

      const appendErrors = variantResult?.data?.productVariantAppendMedia?.userErrors;
      if (appendErrors && appendErrors.length > 0) {
        return { success: false, error: appendErrors.map((e: any) => e.message).join(', ') };
      }
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

export async function deleteProduct(id: string) {
  const mutation = `
    mutation productDelete($input: ProductDeleteInput!) {
      productDelete(input: $input) {
        deletedProductId
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const result = await adminShopifyFetch(mutation, { input: { id } });
    const data = result.data.productDelete;

    if (data.userErrors && data.userErrors.length > 0) {
      return { success: false, error: data.userErrors.map((e: any) => e.message).join(", ") };
    }

    revalidatePath("/shop");
    revalidatePath("/dashboard/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
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
        collections(first: 10) {
          edges {
            node {
              id
              title
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
              image {
                id
                url
                altText
              }
              media(first: 1) {
                edges {
                  node {
                    ... on MediaImage {
                      id
                    }
                  }
                }
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
    const product = result.data.product;

    if (product?.variants?.edges) {
      product.variants.edges.forEach((edge: any) => {
        const mediaNode = edge.node.media?.edges?.[0]?.node;
        if (edge.node.image && mediaNode?.id) {
          edge.node.image.id = mediaNode.id;
        }
      });
    }

    return { success: true, data: product };
  } catch (error: any) {
    console.error("Error fetching admin product:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminProducts(first = 10, after?: string, query?: string, sortKey = "CREATED_AT", reverse = true) {
  const gqlQuery = `
    query getAdminProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
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
            updatedAt
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
    const result = await adminShopifyFetch(gqlQuery, { first, after, query, sortKey, reverse });
    return { success: true, data: result.data.products };
  } catch (error: any) {
    console.error("Error fetching admin products:", error);
    return { success: false, error: error.message };
  }
}
