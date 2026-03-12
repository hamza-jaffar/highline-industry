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

export async function getStagedUploadUrl(filename: string, mimeType: string) {
  const mutation = `
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
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
    const variables = {
      input: [
        {
          filename,
          mimeType,
          resource: "IMAGE",
          httpMethod: "POST",
        },
      ],
    };

    const result = await adminShopifyFetch(mutation, variables);
    const data = result.data.stagedUploadsCreate;

    if (data.userErrors.length > 0) {
      return { success: false, errors: data.userErrors };
    }

    return { success: true, target: data.stagedTargets[0] };
  } catch (error: any) {
    console.error("Error getting staged upload URL:", error);
    return { success: false, error: error.message };
  }
}

export async function saveCollection(formData: { id?: string; title: string; handle?: string; description?: string; parentId?: string; imageUrl?: string; imageBase64?: string; imageType?: string; imageName?: string }) {
  const mutation = formData.id ? `
    mutation collectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  ` : `
    mutation collectionCreate($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    let finalImageUrl = formData.imageUrl;

    // Handle File Upload if base64 is provided
    if (formData.imageBase64 && formData.imageType && formData.imageName) {
      // Sanitize filename: remove special chars, add timestamp for uniqueness
      const extension = formData.imageName.split('.').pop();
      const sanitizedBase = formData.imageName
        .split('.')[0]
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      const uniqueFilename = `${sanitizedBase}_${Date.now()}.${extension}`;

      console.log(`Starting staged upload for: ${uniqueFilename} (original: ${formData.imageName})`);
      const staged = await getStagedUploadUrl(uniqueFilename, formData.imageType);
      
      if (!staged.success) {
        return { success: false, error: `Failed to initialize image upload: ${staged.error || (staged.errors && JSON.stringify(staged.errors)) || 'Unknown error'}` };
      }

      const { url, parameters, resourceUrl } = staged.target;
      
      // Prepare FormData for upload to GCS/Shopify
      const uploadFormData = new FormData();
      parameters.forEach((p: any) => {
        uploadFormData.append(p.name, p.value);
      });
      
      // Convert base64 to Blob using Buffer for better reliability on server
      const buffer = Buffer.from(formData.imageBase64, 'base64');
      const blob = new Blob([buffer], { type: formData.imageType });
      uploadFormData.append("file", blob, uniqueFilename);

      // Perform the upload
      const uploadResult = await fetch(url, {
        method: "POST",
        body: uploadFormData,
      });

      if (uploadResult.ok) {
        finalImageUrl = resourceUrl;
        console.log(`Successfully uploaded image to staged target. Shopify Resource URL: ${resourceUrl}`);
      } else {
        const errorText = await uploadResult.text();
        console.error("GCS Upload failed:", errorText);
        return { success: false, error: `Image storage failed: ${uploadResult.status} ${uploadResult.statusText}` };
      }
    }

    const input: any = {
      title: formData.title,
      descriptionHtml: formData.description
    };

    if (formData.handle && formData.handle.trim() !== "") {
      input.handle = formData.handle;
    }

    if (formData.id) {
      input.id = formData.id;
    }

    if (finalImageUrl) {
      input.image = {
        altText: formData.title,
        src: finalImageUrl
      };
    }

    // Add parent relationship using a metafield
    if (formData.parentId) {
      input.metafields = [
        {
          namespace: "custom",
          key: "parent_collection_id",
          value: formData.parentId,
          type: "single_line_text_field"
        }
      ];
    }

    const variables = { input };
    const result = await adminShopifyFetch(mutation, variables);
    const data = formData.id ? result.data.collectionUpdate : result.data.collectionCreate;

    if (data.userErrors && data.userErrors.length > 0) {
      return { success: false, error: data.userErrors.map((e: any) => e.message).join(", ") };
    }

    revalidatePath("/shop");
    revalidatePath("/dashboard/admin/collections");
    if (formData.id) revalidatePath(`/dashboard/admin/collections/${formData.id.split('/').pop()}`);
    
    return { success: true, collection: data.collection };
  } catch (error: any) {
    console.error("Error saving collection:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminCollection(id: string) {
  const query = `
    query getCollection($id: ID!) {
      collection(id: $id) {
        id
        title
        handle
        descriptionHtml
        image {
          url
          altText
        }
        productsCount {
          count
        }
        metafield(namespace: "custom", key: "parent_collection_id") {
          value
        }
      }
    }
  `;

  try {
    const result = await adminShopifyFetch(query, { id });
    const collection = result.data.collection;
    
    // Also fetch sub-collections (collections where parent_collection_id = this id)
    // Note: We can't easily query metafields in a collection list effectively without special indexes, 
    // but we can fetch all and filter for now, or use a specific naming convention.
    // For now, we'll just return the collection data.
    
    return { success: true, data: collection };
  } catch (error: any) {
    console.error("Error fetching admin collection:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCollection(id: string) {
  const mutation = `
    mutation collectionDelete($input: CollectionDeleteInput!) {
      collectionDelete(input: $input) {
        deletedCollectionId
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const result = await adminShopifyFetch(mutation, { input: { id } });
    const data = result.data.collectionDelete;

    if (data.userErrors.length > 0) {
      return { success: false, errors: data.userErrors };
    }

    revalidatePath("/shop");
    revalidatePath("/dashboard/admin/collections");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting collection:", error);
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

export async function getAdminCollections(first = 10, after?: string, query?: string, sortKey = "UPDATED_AT", reverse = true) {
  const gqlQuery = `
    query getAdminCollections($first: Int!, $after: String, $query: String, $sortKey: CollectionSortKeys, $reverse: Boolean) {
      collections(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
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
            updatedAt
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

  try {
    const result = await adminShopifyFetch(gqlQuery, { first, after, query, sortKey, reverse });
    return { success: true, data: result.data.collections };
  } catch (error: any) {
    console.error("Error fetching admin collections:", error);
    return { success: false, error: error.message };
  }
}
