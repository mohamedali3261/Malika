import { publishedAt, publishedContent, publishedSettings } from "@/data/published";
import { defaultSettings } from "@/data/site";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { Product, SiteSettings } from "@/types";
import type { DeepPartial, SiteContent } from "@/types/content";
import { createDefaultContent, mergeContent } from "@/data/defaultContent";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface StoreValue {
  products: Product[];
  settings: SiteSettings;
  wishlist: string[];
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetCatalogue: () => void;
  replaceCatalogue: (products: Product[]) => Promise<void>;
  updateSettings: (settings: SiteSettings) => void;
  content: SiteContent;
  updateContent: (content: SiteContent) => void;
  resetContent: () => void;
  dirty: boolean;
  lastPublishedAt: string | null;
  markPublished: (at: string) => void;
  toggleWishlist: (id: string) => boolean;
  isWished: (id: string) => boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

/** A new studio publish bumps the storage key so the deployment wins over stale local edits. */
const catalogueVersion = publishedAt ? `.${publishedAt.replace(/[^0-9]/g, "").slice(0, 14)}` : "";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    fetch('/api/products').then(async r => { if (!r.ok) throw new Error('Catalogue unavailable'); setProducts(await r.json()); }).catch(() => console.error('Catalogue unavailable'));
  }, []);
  const [settings, setSettings] = usePersistentState<SiteSettings>(
    `malika.settings.v2${catalogueVersion}`,
    publishedSettings ? { ...defaultSettings, ...publishedSettings } : defaultSettings
  );
  const [wishlist, setWishlist] = usePersistentState<string[]>("malika.wishlist.v2", []);
  const [storedContent, setStoredContent] = usePersistentState<DeepPartial<SiteContent> | null>(
    `malika.content.v1${catalogueVersion}`,
    publishedContent
  );
  const [dirty, setDirty] = usePersistentState<boolean>("malika.catalogue.dirty.v1", false);

  // A new deployment changes the storage key above, so this browser starts again
  // from the published data. Any "unpublished changes" flag left over from the
  // previous version then describes edits that no longer exist — clear it.
  const [buildSeen, setBuildSeen] = usePersistentState<string>("malika.build.seen.v1", "");
  useEffect(() => {
    if (buildSeen !== publishedAt) {
      setDirty(false);
      setBuildSeen(publishedAt);
    }
    // once, at start-up
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Merging on read means a release that adds new content fields still works
  // with whatever the owner saved earlier.
  const content = useMemo(() => mergeContent(storedContent), [storedContent]);

  const updateContent = useCallback(
    (next: SiteContent) => {
      setStoredContent(next);
      setDirty(true);
    },
    [setStoredContent, setDirty]
  );

  const resetContent = useCallback(() => {
    setStoredContent(createDefaultContent());
    setDirty(true);
  }, [setStoredContent, setDirty]);
  const [lastPublishedAt, setLastPublishedAt] = usePersistentState<string | null>(
    "malika.catalogue.publishedAt.v1",
    null
  );

  const saveProduct = useCallback(async (product: Product) => {
    const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
    if (!response.ok) throw new Error('Could not save product');
    setProducts(prev => [product, ...prev.filter(item => item.id !== product.id)]);
  }, []);
  const deleteProduct = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {method:'DELETE'});
    if (!response.ok) throw new Error('Could not archive product');
    setProducts(prev => prev.filter(item => item.id !== id));
    setWishlist(prev => prev.filter(item => item !== id));
  }, [setWishlist]);
  // Bulk import/reset are deliberately not implemented as partial updates.
  const resetCatalogue = useCallback(() => { throw new Error('Bulk reset is not available with D1'); }, []);
  const replaceCatalogue = useCallback(async (next: Product[]) => {
    const response=await fetch('/api/admin/products/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({products:next})});
    if (!response.ok) { const result=await response.json(); throw new Error(result.error || 'Import failed'); }
    const refreshed=await fetch('/api/products'); if (!refreshed.ok) throw new Error('Import saved but refresh failed');
    setProducts(await refreshed.json());
  }, []);

  const updateSettings = useCallback(
    (next: SiteSettings) => {
      setSettings(next);
      setDirty(true);
    },
    [setSettings, setDirty]
  );

  const markPublished = useCallback(
    (at: string) => {
      setDirty(false);
      setLastPublishedAt(at);
    },
    [setDirty, setLastPublishedAt]
  );

  const toggleWishlist = useCallback(
    (id: string) => {
      const saved = wishlist.includes(id);
      setWishlist(saved ? wishlist.filter((item) => item !== id) : [...wishlist, id]);
      return !saved;
    },
    [wishlist, setWishlist]
  );

  const isWished = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const value = useMemo<StoreValue>(
    () => ({
      products,
      settings,
      wishlist,
      saveProduct,
      deleteProduct,
      resetCatalogue,
      replaceCatalogue,
      updateSettings,
      content,
      updateContent,
      resetContent,
      toggleWishlist,
      isWished,
      dirty,
      lastPublishedAt,
      markPublished,
    }),
    [
      products,
      settings,
      wishlist,
      saveProduct,
      deleteProduct,
      resetCatalogue,
      replaceCatalogue,
      updateSettings,
      content,
      updateContent,
      resetContent,
      toggleWishlist,
      isWished,
      dirty,
      lastPublishedAt,
      markPublished,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
