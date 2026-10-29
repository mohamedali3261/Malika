import { ContactCTA } from "@/pages/Home/ContactCTA";
import { FilterBar } from "@/pages/Shop/FilterBar";
import { ProductGrid } from "@/pages/Shop/ProductGrid";
import { ShopHeroSlider } from "@/pages/Shop/ShopHeroSlider";
import { ShopIntro } from "@/pages/Shop/ShopIntro";
import { useStore } from "@/context/StoreContext";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";
import { useRoute } from "@/lib/router";
import type { Category, Gender, Product, SortKey } from "@/types";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 6;

function searchable(product: Product): string {
  const notes = [...product.notes.top, ...product.notes.heart, ...product.notes.base]
    .flatMap((note) => [note.en, note.ar])
    .join(" ");
  return [product.name.en, product.name.ar, product.tagline.en, product.tagline.ar, product.slug, notes]
    .join(" ")
    .toLowerCase();
}

export function ShopPage() {
  const { t } = useLang();
  const { products, wishlist } = useStore();
  const { c } = useContent();
  const show = c.shopFilters;
  const { query: routeQuery } = useRoute();

  const priceCeiling = useMemo(
    () => Math.max(3500, Math.ceil(Math.max(...products.map((product) => Math.max(...product.sizes.map((size) => size.price))), 3500) / 500) * 500),
    [products]
  );

  const initialCategory = (routeQuery.get("category") as Category | null) ?? "all";
  const initialGender = (routeQuery.get("gender") as Gender | null) ?? "all";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">(initialCategory);
  const [gender, setGender] = useState<Gender | "all">(initialGender);
  const [sort, setSort] = useState<SortKey>("featured");
  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [savedOnly, setSavedOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [priceTouched, setPriceTouched] = useState(false);

  // The ceiling depends on the catalogue, which hydrates from storage after
  // first paint. Without this the slider stays pinned to a stale maximum and
  // silently filters out every newly added product.
  useEffect(() => {
    if (!priceTouched) setMaxPrice(priceCeiling);
    else setMaxPrice((value) => Math.min(value, priceCeiling));
  }, [priceCeiling, priceTouched]);

  useEffect(() => {
    setCategory((routeQuery.get("category") as Category | null) ?? "all");
    setGender((routeQuery.get("gender") as Gender | null) ?? "all");
  }, [routeQuery]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, category, gender, sort, maxPrice, savedOnly]);

  // A filter the owner has hidden must not keep filtering invisibly — for
  // example a leftover ?category= in the address — so it counts as "off".
  const eQuery = show.search ? query : "";
  const eCategory = show.family ? category : "all";
  const eGender = show.gender ? gender : "all";
  const eMax = show.price ? maxPrice : priceCeiling;
  const eSaved = show.savedOnly ? savedOnly : false;
  const eSort = show.sort ? sort : "featured";

  const filtered = useMemo(() => {
    const term = eQuery.trim().toLowerCase();
    const list = products.filter((product) => {
      if (eCategory !== "all" && product.category !== eCategory) return false;
      if (eGender !== "all" && product.gender !== eGender) return false;
      if (eSaved && !wishlist.includes(product.id)) return false;
      // A 100 ml bottle may exceed the budget while the 30 ml fits — judge
      // the product by its cheapest available size.
      const cheapest = Math.min(product.price, ...product.sizes.map((size) => size.price));
      if (cheapest > eMax) return false;
      if (term && !searchable(product).includes(term)) return false;
      return true;
    });

    return list.sort((a, b) => {
      switch (eSort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        case "rating":
          return b.rating - a.rating || b.reviews - a.reviews;
        case "featured":
        default:
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.rating - a.rating;
      }
    });
  }, [products, eCategory, eGender, eSaved, wishlist, eMax, eQuery, eSort]);

  const counts = useMemo(() => {
    const result: Record<Category | "all", number> = { all: products.length, fresh: 0, floral: 0, woody: 0, oriental: 0 };
    for (const product of products) result[product.category] += 1;
    return result;
  }, [products]);

  const isFiltered = eQuery !== "" || eCategory !== "all" || eGender !== "all" || eSaved || eMax < priceCeiling;

  const reset = () => {
    setQuery("");
    setCategory("all");
    setGender("all");
    setSavedOnly(false);
    setPriceTouched(false);
    setMaxPrice(priceCeiling);
    setSort("featured");
  };

  return (
    <div className="anim-page">
      {/* The slider replaces the old page header, so the page title is kept for
          screen readers and search engines. */}
      <h1 className="sr-only">{t("shop.title")}</h1>
      <ShopHeroSlider />
      <ShopIntro count={products.length} />
      <section className="bg-bone pb-4 pt-5">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <FilterBar
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            gender={gender}
            setGender={setGender}
            sort={sort}
            setSort={setSort}
            maxPrice={maxPrice}
            priceCeiling={priceCeiling}
            setMaxPrice={(value) => {
              setPriceTouched(true);
              setMaxPrice(value);
            }}
            savedOnly={savedOnly}
            setSavedOnly={setSavedOnly}
            counts={counts}
            show={show}
            isFiltered={isFiltered}
            reset={reset}
          />
          <ProductGrid
            products={filtered.slice(0, visible)}
            total={filtered.length}
            visible={visible}
            onMore={() => setVisible((count) => count + PAGE_SIZE)}
            onReset={reset}
            emptySaved={eSaved && wishlist.length === 0}
          />
        </div>
      </section>
      <div className="bg-bone pt-8">
        <ContactCTA />
      </div>
    </div>
  );
}
