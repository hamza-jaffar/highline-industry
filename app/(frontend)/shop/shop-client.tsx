"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShopifyProductEdge } from "@/lib/shopify/product.query";
import { loadMoreProducts } from "@/app/actions/shop.action";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest Arrivals", value: "new" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

interface ShopClientProps {
  initialProducts: ShopifyProductEdge[];
  initialPageInfo: { hasNextPage: boolean; endCursor: string | null };
  collectionParam?: string;
  sortParam?: string;
  queryParam?: string;
  subCollections?: any[];
  currentCollection?: any;
  allCollections?: any[];
}

function ShopClientInner({
  initialProducts,
  initialPageInfo,
  collectionParam,
  sortParam,
  queryParam,
  subCollections = [],
  currentCollection,
  allCollections = [],
}: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState(initialProducts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync state with props when URL changes (next.js soft navigation)
  useEffect(() => {
    setProducts(initialProducts);
    setPageInfo(initialPageInfo);
  }, [initialProducts, initialPageInfo]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const activeCategory = collectionParam || "";
  const activeSortValue = sortParam || "featured";
  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === activeSortValue)?.label || "Featured";
  const activeQuery = queryParam || "";

  const dynamicCategories = [
    { label: "All", value: "", type: "collection" },
    { label: "New Arrivals", value: "new", type: "sort" },
    ...allCollections.map((col) => ({
      label: col.title,
      value: col.handle,
      type: "collection",
    })),
  ];

  const [searchValue, setSearchValue] = useState(activeQuery);

  // Sync input value with URL changes (e.g., navigating back)
  useEffect(() => {
    setSearchValue(activeQuery);
  }, [activeQuery]);

  // Handle URL updates for filtering and sorting
  const updateUrlParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/shop?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  // Debounced real-time search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== activeQuery) {
        updateUrlParams("q", searchValue);
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchValue, activeQuery, updateUrlParams]);

  const isCatActive = (cat: any) => {
    if (cat.type === "sort") {
      return activeSortValue === cat.value && !activeCategory;
    }
    if (cat.value === "") {
      return !activeCategory && activeSortValue !== "new";
    }
    return activeCategory === cat.value;
  };

  const handleCatClick = (cat: any) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat.type === "sort") {
      params.set("sort", cat.value);
      params.delete("collection");
    } else {
      if (cat.value) {
        params.set("collection", cat.value);
      } else {
        params.delete("collection");
        params.delete("sort");
      }
      if (activeSortValue === "new" && cat.value) {
        params.delete("sort");
      }
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scroll when filter is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFilterOpen]);

  // Infinite Scroll Logic
  const handleLoadMore = useCallback(async () => {
    if (!pageInfo.hasNextPage || !pageInfo.endCursor || isLoadingMore) return;

    setIsLoadingMore(true);

    let sortKey = "RELEVANCE";
    let reverse = false;

    if (activeSortValue === "new") {
      sortKey = "CREATED_AT";
      reverse = true;
    } else if (activeSortValue === "price-asc") {
      sortKey = "PRICE";
      reverse = false;
    } else if (activeSortValue === "price-desc") {
      sortKey = "PRICE";
      reverse = true;
    }

    const data = await loadMoreProducts(
      activeCategory || undefined,
      sortKey,
      reverse,
      activeQuery || undefined,
      pageInfo.endCursor,
    );

    if (data) {
      setProducts((prev) => [...prev, ...data.edges]);
      setPageInfo(data.pageInfo);
    }

    setIsLoadingMore(false);
  }, [pageInfo, isLoadingMore, activeCategory, activeSortValue, activeQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleLoadMore]);

  return (
    <>
      <div className="flex flex-col w-full min-h-screen pb-20 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 mt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#c0c0c0]">
              <Link href="/shop" className="hover:text-black transition-colors">
                Catalog
              </Link>
              {currentCollection && (
                <>
                  <span className="text-black/20">/</span>
                  <span className="text-black">{currentCollection.title}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-sora font-semibold text-[#111] tracking-tight">
              {currentCollection?.title || "The Catalog"}
            </h1>
            <p className="text-muted text-sm">
              {currentCollection?.description ||
                "Engineered garments for modern brands."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-black/10 rounded-md text-sm text-[#111] bg-white placeholder:text-muted focus:outline-none focus:border-black transition-colors shadow-sm"
              />
              {searchValue && (
                <button
                  onClick={() => {
                    setSearchValue("");
                    updateUrlParams("q", "");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-black p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-black/10 rounded-md text-sm font-medium text-black bg-white hover:bg-black/5 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-black/10 rounded-md text-sm font-medium text-black bg-white hover:bg-black/5 transition-colors shadow-sm"
              >
                Sort by: {activeSortLabel.split(":")[0]}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Sort Dropdown */}
              {isSortOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-black/10 rounded-lg shadow-elevated z-40 py-1 origin-top-right animate-in fade-in slide-in-from-top-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateUrlParams("sort", option.value);
                        setIsSortOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#111] hover:bg-surface flex items-center justify-between"
                    >
                      {option.label}
                      {activeSortValue === option.value && (
                        <Check className="w-4 h-4 text-black" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories / Sub-collections */}
        <div className="flex overflow-x-auto pb-4 mb-8 no-scrollbar gap-2 border-b border-black/5">
          {!currentCollection || subCollections.length === 0 ? (
            dynamicCategories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCatClick(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${isCatActive(cat)
                  ? "bg-black text-white"
                  : "text-muted hover:text-black hover:bg-black/5"
                  }`}
              >
                {cat.label}
              </button>
            ))
          ) : (
            <>
              <button
                onClick={() =>
                  updateUrlParams("collection", currentCollection.handle)
                }
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${activeCategory === currentCollection.handle
                  ? "bg-black text-white"
                  : "text-muted hover:text-black hover:bg-black/5"
                  }`}
              >
                All {currentCollection.title}
              </button>
              {subCollections.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => updateUrlParams("collection", sub.handle)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${activeCategory === sub.handle
                    ? "bg-black text-white"
                    : "text-muted hover:text-black hover:bg-black/5"
                    }`}
                >
                  {sub.title}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-6">
          {products.map(({ node: product }) => (
            <div key={product.id} className="group block space-y-4">
              <div onClick={() => router.push(`/product/${product.handle}`)}>
                <div className="relative aspect-4/5 bg-surface border border-black/10 rounded-xl overflow-hidden transition-all group-hover:shadow-elevated group-hover:border-black/20">
                  {product.featuredImage?.url ? (
                    <img
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-black/5 font-black text-9xl select-none group-hover:scale-105 transition-transform duration-500">
                      {product.title[0]}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

                  <div className="absolute bottom-0 w-full left-0 z-100 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <Link
                      href={`/customizer/${product.handle}`}
                      className="block text-center w-full py-3 bg-white border border-black/10 rounded-lg text-[#111] text-sm font-semibold shadow-sm hover:bg-black hover:text-white hover:border-black transition-all"
                    >
                      Design Now
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted truncate w-32">
                    {product.tags?.[0] || "Apparel"}
                  </p>
                  <h3 className="text-sm font-semibold text-[#111] truncate w-40">
                    {product.title}
                  </h3>
                </div>
                <p className="font-semibold text-sm text-[#111]">
                  <span className="text-muted text-xs">FROM </span>
                  <span className="font-semibold">
                    {product.priceRange?.minVariantPrice?.amount || "0.00"}{" "}
                    {product.priceRange?.minVariantPrice?.currencyCode}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Intersection Observer Target */}
        {pageInfo.hasNextPage && (
          <div
            ref={observerTarget}
            className="w-full py-12 flex justify-center"
          >
            {isLoadingMore ? (
              <Loader2 className="w-6 h-6 animate-spin text-black/40" />
            ) : (
              <div className="h-6" /> // spacer to trigger intersection
            )}
          </div>
        )}

        {!pageInfo.hasNextPage && products.length > 0 && (
          <div className="w-full py-12 flex justify-center text-sm text-muted">
            You've reached the end of the catalog.
          </div>
        )}

        {products.length === 0 && (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-sora font-semibold text-[#111] mb-2">
              No products found
            </h2>
            <p className="text-muted text-sm">
              Try adjusting your filters or browsing a different category.
            </p>
          </div>
        )}
      </div>

      {/* Filter Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-150 bg-black/20 backdrop-blur-sm transition-opacity duration-300 flex justify-end ${isFilterOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsFilterOpen(false)}
      >
        {/* Sidebar Panel */}
        <div
          className={`w-full max-w-sm bg-white h-full shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${isFilterOpen ? "translate-x-0" : "translate-x-full"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-16 border-b border-black/5 flex items-center justify-between px-6 shrink-0">
            <h2 className="text-base font-sora font-semibold text-[#111]">
              Filters
            </h2>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="p-2 text-muted hover:text-black transition-colors rounded-full hover:bg-surface"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-10">
            {/* Category Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#111]">Category</h3>
              <div className="space-y-3">
                {dynamicCategories.slice(1).map((cat) => (
                  <label
                    key={cat.label}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={isCatActive(cat)}
                      onChange={() => handleCatClick(cat)}
                      className="hidden"
                    />
                    <div className="w-4 h-4 border border-black/20 rounded-sm flex items-center justify-center group-hover:border-black transition-colors">
                      {isCatActive(cat) && (
                        <Check className="w-3 h-3 text-black" />
                      )}
                    </div>
                    <span className="text-sm text-muted group-hover:text-black transition-colors">
                      {cat.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Keeping UI for size and color but they don't do anything structurally yet because Shopify filtering requires more complex GraphQL queries not in scope of standard getProducts without tags/options handling */}
            <div className="space-y-4 opacity-50 pointer-events-none">
              <p className="text-xs text-muted italic">
                Size & Color filtering coming soon.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-black/5 bg-surface shrink-0 flex gap-4">
            <button
              onClick={() => router.push("/shop")}
              className="flex-1 py-3 bg-white border border-black/10 text-[#111] text-sm font-semibold rounded-md hover:bg-black/5 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="flex-1 py-3 bg-[#111] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-black transition-colors"
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ShopClient(props: ShopClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        </div>
      }
    >
      <ShopClientInner {...props} />
    </Suspense>
  );
}
