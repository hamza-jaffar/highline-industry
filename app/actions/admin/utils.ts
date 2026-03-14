"use server";

import { adminShopifyFetch } from "@/lib/shopify/admin";

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
