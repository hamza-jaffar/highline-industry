import { getSingleProduct } from "@/lib/shopify/product.query";
import { notFound } from "next/navigation";
import ProductPageClient from "./product-page-client";

export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  const product = await getSingleProduct(params.handle);

  if (!product) {
    notFound();
  }

  // Flatten the images
  const images = product.images.edges.map((edge: any) => edge.node);

  return <ProductPageClient product={product} images={images} />;
}
