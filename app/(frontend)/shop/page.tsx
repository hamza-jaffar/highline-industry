import { getProducts } from "@/lib/shopify/product.query";
import ShopClient from "./shop-client";

export const metadata = {
  title: "Shop - Highline Industry",
  description: "Engineered garments for modern brands.",
};

export default async function ShopPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const collection = searchParams.collection;
  const sort = searchParams.sort;
  const q = searchParams.q;

  const collectionParam = typeof collection === 'string' ? collection : undefined;
  const sortParam = typeof sort === 'string' ? sort : undefined;
  const queryParam = typeof q === 'string' ? q : undefined;

  let sortKey = "RELEVANCE";
  let reverse = false;

  if (sortParam === "new" || sortParam === "newest") {
    sortKey = "CREATED_AT";
    reverse = true;
  } else if (sortParam === "price-asc") {
    sortKey = "PRICE";
    reverse = false;
  } else if (sortParam === "price-desc") {
    sortKey = "PRICE";
    reverse = true;
  }

  const { getCollectionByHandle, getSubCollections, getCollections } = await import("@/lib/shopify/collection.query");
  
  const allCollections = await getCollections();
  const topLevelCollections = allCollections.filter((c: any) => !c.metafield?.value);
  
  let currentCollection = null;
  let subCollections: any[] = [];
  
  if (collectionParam) {
    currentCollection = await getCollectionByHandle(collectionParam);
    if (currentCollection) {
      subCollections = await getSubCollections(currentCollection.id);
    }
  }

  const { edges, pageInfo } = await getProducts({
    collection: collectionParam,
    sortKey,
    reverse,
    query: queryParam,
    first: 12,
  });

  return (
    <ShopClient
      initialProducts={edges}
      initialPageInfo={pageInfo}
      collectionParam={collectionParam}
      sortParam={sortParam}
      queryParam={queryParam}
      subCollections={subCollections}
      currentCollection={currentCollection}
      allCollections={topLevelCollections}
    />
  );
}
