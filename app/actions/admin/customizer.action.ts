"use server";

import { db } from "@/db";
import { ProductViews, customizationZones } from "@/db/schemas/product-customization.schema";
import { eq } from "drizzle-orm";
import { getStagedUploadUrl } from "./utils";
import { CustomizerState, Area, PartDefinition } from "@/app/dashboard/admin/products/[id]/customizer/types";

async function uploadToShopify(base64Data: string, filename: string, mimeType: string) {
  if (!base64Data || !base64Data.startsWith('data:')) return base64Data; // Already a URL or empty

  const sanitizedBase = filename
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
  const uniqueFilename = `${sanitizedBase}_${Date.now()}.${mimeType.split('/')[1]}`;

  const staged = await getStagedUploadUrl(uniqueFilename, mimeType);
  if (!staged.success) throw new Error("Failed to get staged upload URL");

  const { url, parameters, resourceUrl } = staged.target;
  const uploadFormData = new FormData();
  parameters.forEach((p: any) => uploadFormData.append(p.name, p.value));

  const base64Content = base64Data.split(',')[1];
  const buffer = Buffer.from(base64Content, 'base64');
  const blob = new Blob([buffer], { type: mimeType });
  uploadFormData.append("file", blob, uniqueFilename);

  const uploadResult = await fetch(url, { method: "POST", body: uploadFormData });
  if (!uploadResult.ok) throw new Error("Failed to upload image to Shopify");

  return resourceUrl;
}

export async function saveCustomizerConfig(productId: string, state: CustomizerState) {
  try {
    // 1. Process all images and upload to Shopify if needed
    const processedCommonImages: { [key: string]: string } = {};
    for (const [name, url] of Object.entries(state.commonImages)) {
      if (url && url.startsWith('data:')) {
        processedCommonImages[name] = await uploadToShopify(url, `${productId}_${name}`, "image/png");
      } else {
        processedCommonImages[name] = url;
      }
    }

    const processedColorImages: { [color: string]: { [name: string]: string } } = {};
    for (const [color, images] of Object.entries(state.colorImages)) {
      processedColorImages[color] = {};
      for (const [name, url] of Object.entries(images)) {
        if (url && url.startsWith('data:')) {
          processedColorImages[color][name] = await uploadToShopify(url, `${productId}_${color}_${name}`, "image/png");
        } else {
          processedColorImages[color][name] = url;
        }
      }
    }

    // 2. Database transaction to update Supabase
    await db.transaction(async (tx) => {
      // Clear existing configs for this product
      const existingViews = await tx.select().from(ProductViews).where(eq(ProductViews.productId, productId));
      for (const view of existingViews) {
        await tx.delete(customizationZones).where(eq(customizationZones.viewId, view.id));
      }
      await tx.delete(ProductViews).where(eq(ProductViews.productId, productId));

      // Insert new configs
      for (const [name, partDef] of Object.entries(state.parts) as [string, PartDefinition][]) {
        if (partDef.isCommon) {
          const imageUrl = processedCommonImages[name];
          if (imageUrl) {
            const [view] = await tx.insert(ProductViews).values({
              productId,
              name,
              isCommon: true,
              imageUrl,
            }).returning();

            if (partDef.areas.length > 0) {
              await tx.insert(customizationZones).values(
                partDef.areas.map(area => ({
                  viewId: view.id,
                  name: `Area ${area.id}`,
                  x: Math.round(area.x),
                  y: Math.round(area.y),
                  width: Math.round(area.width),
                  height: Math.round(area.height),
                  allowedType: area.allowedType,
                  imagePrice: area.imagePrice,
                  textPrice: area.textPrice,
                }))
              );
            }
          }
        } else {
          // Color-specific images, but SHARED areas
          for (const color of Object.keys(processedColorImages)) {
            const imageUrl = processedColorImages[color][name];
            if (imageUrl) {
              const [view] = await tx.insert(ProductViews).values({
                productId,
                name,
                color,
                isCommon: false,
                imageUrl,
              }).returning();

              if (partDef.areas.length > 0) {
                await tx.insert(customizationZones).values(
                  partDef.areas.map(area => ({
                    viewId: view.id,
                    name: `Area ${area.id}`,
                    x: Math.round(area.x),
                    y: Math.round(area.y),
                    width: Math.round(area.width),
                    height: Math.round(area.height),
                    allowedType: area.allowedType,
                    imagePrice: area.imagePrice,
                    textPrice: area.textPrice,
                  }))
                );
              }
            }
          }
        }
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error saving customizer config:", error);
    return { success: false, error: error.message };
  }
}

export async function getCustomizerConfig(productId: string) {
  try {
    const views = await db.select().from(ProductViews).where(eq(ProductViews.productId, productId));

    const state: CustomizerState = {
      parts: {},
      commonImages: {},
      colorImages: {}
    };

    for (const view of views) {
      const zones = await db.select().from(customizationZones).where(eq(customizationZones.viewId, view.id));
      const areas: Area[] = zones.map(z => ({
        id: Math.random().toString(36).substr(2, 9),
        name: z.name || undefined,
        x: z.x,
        y: z.y,
        width: z.width,
        height: z.height,
        allowedType: (z.allowedType as any) || "both",
        imagePrice: z.imagePrice || 0,
        textPrice: z.textPrice || 0
      }));

      if (!state.parts[view.name!]) {
        state.parts[view.name!] = {
          id: view.id,
          name: view.name!,
          isCommon: view.isCommon || false,
          areas: areas // Use areas from the first view we find for this part
        };
      }

      if (view.isCommon) {
        state.commonImages[view.name!] = view.imageUrl;
      } else if (view.color) {
        if (!state.colorImages[view.color]) state.colorImages[view.color] = {};
        state.colorImages[view.color][view.name!] = view.imageUrl;
      }
    }

    return { success: true, data: state };
  } catch (error: any) {
    console.error("Error fetching customizer config:", error);
    return { success: false, error: error.message };
  }
}
