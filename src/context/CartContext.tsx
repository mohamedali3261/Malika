import { usePersistentState } from "@/hooks/usePersistentState";
import type { CartLine, Product } from "@/types";
import { useCallback, useContext, useEffect, useMemo, useState, createContext, type ReactNode } from "react";
import { useRoute } from "@/lib/router";

interface CartValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  checkoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  add: (product: Product, ml: number, price: number, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = usePersistentState<CartLine[]>("malika.cart.v2", []);
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { path } = useRoute();

  // A sheet should never survive a navigation.
  useEffect(() => {
    setIsOpen(false);
    setCheckoutOpen(false);
  }, [path]);

  const add = useCallback(
    (product: Product, ml: number, price: number, qty = 1) => {
      const key = `${product.id}-${ml}`;
      setLines((prev) => {
        const existing = prev.find((line) => line.key === key);
        if (existing) {
          return prev.map((line) =>
            line.key === key ? { ...line, qty: Math.min(line.qty + qty, 20) } : line
          );
        }
        return [
          ...prev,
          {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            ml,
            price,
            qty,
          },
        ];
      });
    },
    [setLines]
  );

  const setQty = useCallback(
    (key: string, qty: number) => {
      setLines((prev) =>
        qty <= 0
          ? prev.filter((line) => line.key !== key)
          : prev.map((line) => (line.key === key ? { ...line, qty: Math.min(qty, 20) } : line))
      );
    },
    [setLines]
  );

  const remove = useCallback(
    (key: string) => setLines((prev) => prev.filter((line) => line.key !== key)),
    [setLines]
  );

  const clear = useCallback(() => setLines([]), [setLines]);

  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count,
      subtotal,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      checkoutOpen,
      openCheckout: () => {
        setIsOpen(false);
        setCheckoutOpen(true);
      },
      closeCheckout: () => setCheckoutOpen(false),
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, count, subtotal, isOpen, checkoutOpen, add, setQty, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
