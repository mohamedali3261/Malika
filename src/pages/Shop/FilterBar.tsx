import { ChevronDown, Heart, Search, Sliders, X } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { formatNumber, formatPrice } from "@/lib/format";
import type { Category, Gender, SortKey } from "@/types";
import type { ShopFiltersContent } from "@/types/content";
import { cn } from "@/utils/cn";
import { useState, type CSSProperties } from "react";

interface FilterBarProps {
  query: string;
  setQuery: (value: string) => void;
  category: Category | "all";
  setCategory: (value: Category | "all") => void;
  gender: Gender | "all";
  setGender: (value: Gender | "all") => void;
  sort: SortKey;
  setSort: (value: SortKey) => void;
  maxPrice: number;
  priceCeiling: number;
  setMaxPrice: (value: number) => void;
  savedOnly: boolean;
  setSavedOnly: (value: boolean) => void;
  isFiltered: boolean;
  reset: () => void;
  /** Products per family, over the whole catalogue. */
  counts: Record<Category | "all", number>;
  /** Which filters the owner has switched on (Studio → Shop filters). */
  show: ShopFiltersContent;
}

const categoryKeys: (Category | "all")[] = ["all", "fresh", "floral", "woody", "oriental"];
const genderKeys: (Gender | "all")[] = ["all", "women", "men", "unisex"];
const sortOptions = [
  { key: "featured", label: "shop.sortFeatured" },
  { key: "newest", label: "shop.sortNew" },
  { key: "price-asc", label: "shop.sortPriceAsc" },
  { key: "price-desc", label: "shop.sortPriceDesc" },
  { key: "rating", label: "shop.sortRating" },
] as const;

const categoryLabel = {
  all: "shop.all",
  fresh: "shop.fresh",
  floral: "shop.floral",
  woody: "shop.woody",
  oriental: "shop.oriental",
} as const;

const genderLabel = {
  all: "shop.all",
  women: "shop.women",
  men: "shop.men",
  unisex: "shop.unisex",
} as const;

/**
 * One line on desktop, three short rows on a phone:
 *   search · scent families · sort · [More]
 * Everything secondary (gender, price, saved) hides behind a single "More"
 * button, which wears a badge while any of it is active.
 */
export function FilterBar(props: FilterBarProps) {
  const { t, x, lang } = useLang();
  const {
    query, setQuery, category, setCategory, gender, setGender, sort, setSort,
    maxPrice, priceCeiling, setMaxPrice, savedOnly, setSavedOnly, isFiltered, reset, counts, show,
  } = props;

  const [open, setOpen] = useState(false);

  const hasMore = show.gender || show.price || show.savedOnly;
  const extras =
    Number(show.gender && gender !== "all") + Number(show.price && maxPrice < priceCeiling) + Number(show.savedOnly && savedOnly);
  const percent = ((maxPrice - 1000) / Math.max(priceCeiling - 1000, 1)) * 100;

  if (!show.search && !show.family && !show.sort && !hasMore) return null;

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-2.5 sm:p-3">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3">
        {show.search && (
          <label className="relative block lg:w-64 lg:shrink-0 xl:w-72">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("shop.search")}
              className="field h-11 ps-10 pe-9"
              aria-label={t("shop.search")}
              type="search"
              enterKeyHint="search"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute end-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-ink/5 text-mist hover:text-ink"
                aria-label={t("shop.clearSearch")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        )}

        {show.family && (
          <div className="no-scrollbar -mx-0.5 flex flex-1 items-center gap-1.5 overflow-x-auto px-0.5 py-0.5">
            {categoryKeys.map((key) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                aria-pressed={category === key}
                className={cn(
                  "flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[12px] font-bold transition-colors duration-300",
                  category === key
                    ? "border-ink bg-ink text-bone"
                    : "border-ink/12 bg-white/50 text-ink/65 hover:border-ink/30 hover:text-ink"
                )}
              >
                {key === "all" ? t("shop.all") : t(categoryLabel[key])}
                <span className={cn("ms-1.5 text-[10px] font-extrabold tabular-nums", category === key ? "text-bone/55" : "text-ink/35")}>
                  {formatNumber(counts[key] ?? 0, lang)}
                </span>
              </button>
            ))}
          </div>
        )}

        {(show.sort || hasMore || isFiltered) && (
          <div className="flex items-center gap-2 lg:ms-auto lg:shrink-0">
            {show.sort && (
              <div className="relative min-w-0 flex-1 lg:flex-none">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  aria-label={t("shop.sort")}
                  className="h-10 w-full appearance-none rounded-full border border-ink/12 bg-white/60 pe-8 ps-3.5 text-[12px] font-semibold text-ink outline-none focus:border-ink"
                >
                  {sortOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {t(option.label)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-3 w-3 -translate-y-1/2 text-mist" />
              </div>
            )}

            {hasMore && (
              <button
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls="shop-more-filters"
                className={cn(
                  "flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-bold transition-colors",
                  open || extras > 0 ? "border-ink bg-ink text-bone" : "border-ink/12 text-ink/70 hover:border-ink/35"
                )}
              >
                <Sliders className="h-3.5 w-3.5" />
                {x("More", "المزيد")}
                {extras > 0 && (
                  <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-acid px-1 text-[9px] font-extrabold text-ink">{extras}</span>
                )}
              </button>
            )}

            {isFiltered && (
              <button
                onClick={reset}
                aria-label={t("shop.clear")}
                title={t("shop.clear")}
                className="press grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/12 text-ink/70 hover:border-ink hover:bg-ink hover:text-bone"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {hasMore && open && (
        <div id="shop-more-filters" className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ink/10 pt-3">
          {show.gender && (
            <div className="flex items-center gap-1.5">
              <span className="me-1 text-[10px] font-bold uppercase tracking-[0.14em] text-mist">{t("shop.gender")}</span>
              <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
                {genderKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => setGender(key)}
                    aria-pressed={gender === key}
                    className={cn(
                      "h-8 shrink-0 rounded-full px-3 text-[12px] font-semibold transition-colors",
                      gender === key ? "bg-ink text-bone" : "bg-ink/5 text-ink/65 hover:bg-ink/10"
                    )}
                  >
                    {t(genderLabel[key])}
                  </button>
                ))}
              </div>
            </div>
          )}

          {show.price && (
            <div className="flex min-w-[200px] flex-1 items-center gap-2.5 sm:max-w-[320px]">
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-mist">{t("shop.price")}</span>
              <input
                type="range"
                min={1000}
                max={priceCeiling}
                step={100}
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                className="range-acid w-full min-w-[70px]"
                style={{ "--range": `${Math.min(Math.max(percent, 0), 100)}%` } as CSSProperties}
                aria-label={t("shop.price")}
              />
              <span className="shrink-0 whitespace-nowrap text-[12px] font-bold">{formatPrice(maxPrice, lang)}</span>
            </div>
          )}

          {show.savedOnly && (
            <button
              onClick={() => setSavedOnly(!savedOnly)}
              aria-pressed={savedOnly}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-colors",
                savedOnly ? "bg-lilac text-ink" : "bg-ink/5 text-ink/65 hover:bg-ink/10"
              )}
            >
              <Heart className="h-3.5 w-3.5" fill={savedOnly ? "currentColor" : "none"} />
              {t("shop.savedOnly")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
