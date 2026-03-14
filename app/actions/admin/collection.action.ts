"use server";

import { adminShopifyFetch } from "@/lib/shopify/admin";
import { revalidatePath } from "next/cache";
import { getStagedUploadUrl } from "./utils";

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

    if (formData.imageBase64 && formData.imageType && formData.imageName) {
      const extension = formData.imageName.split('.').pop();
      const sanitizedBase = formData.imageName
        .split('.')[0]
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      const uniqueFilename = `${sanitizedBase}_${Date.now()}.${extension}`;

      const staged = await getStagedUploadUrl(uniqueFilename, formData.imageType);

      if (!staged.success) {
        return { success: false, error: `Failed to initialize image upload: ${staged.error || (staged.errors && JSON.stringify(staged.errors)) || 'Unknown error'}` };
      }

      const { url, parameters, resourceUrl } = staged.target;
      const uploadFormData = new FormData();
      parameters.forEach((p: any) => {
        uploadFormData.append(p.name, p.value);
      });

      const buffer = Buffer.from(formData.imageBase64, 'base64');
      const blob = new Blob([buffer], { type: formData.imageType });
      uploadFormData.append("file", blob, uniqueFilename);

      const uploadResult = await fetch(url, {
        method: "POST",
        body: uploadFormData,
      });

      if (uploadResult.ok) {
        finalImageUrl = resourceUrl;
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
