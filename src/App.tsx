import { GitHubOAuthHandler } from "@/components/GitHubOAuthHandler";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BackToTop } from "@/components/layout/BackToTop";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { HomeLoader } from "@/components/layout/HomeLoader";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { useSecretKeyword } from "@/components/layout/SecretEntry";
import { CartProvider, useCart } from "@/context/CartContext";
import { StoreProvider } from "@/context/StoreContext";
import { ThemeModeProvider } from "@/context/ThemeModeContext";
import { ToastProvider } from "@/context/ToastContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { trackPageView } from "@/lib/analytics";
import { useRoute } from "@/lib/router";
import { HomePage } from "@/pages/Home";
import { NotFoundPage } from "@/pages/NotFound/NotFoundPage";
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";

const ShopPage = lazy(() => import("@/pages/Shop").then((m) => ({ default: m.ShopPage })));
const WishlistPage = lazy(() => import("@/pages/Wishlist").then((m) => ({ default: m.WishlistPage })));
const ProductPage = lazy(() => import("@/pages/Product").then((m) => ({ default: m.ProductPage })));
const ContactPage = lazy(() => import("@/pages/Contact").then((m) => ({ default: m.ContactPage })));
const TrackOrder = lazy(() => import("@/pages/TrackOrder").then((m) => ({ default: m.TrackOrder })));
const StudioGate = lazy(() => import("@/pages/Admin/StudioGate").then((m) => ({ default: m.StudioGate })));
const CheckoutSheet = lazy(() => import("@/components/cart/CheckoutSheet").then((m) => ({ default: m.CheckoutSheet })));

function RouteFallback() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10" aria-busy="true">
      <div className="m-skeleton-wave h-48 w-full rounded-[1.8rem]" />
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="m-skeleton-wave h-[304px] rounded-[18px] sm:h-[340px]" />
        ))}
      </div>
    </div>
  );
}

function AppShell() {
  const { path } = useRoute();
  const [homeLoaderOpen, setHomeLoaderOpen] = useState(() => path === "/");
  const closeHomeLoader = useCallback(() => setHomeLoaderOpen(false), []);
  const lastAnalyticsPath = useRef<string | null>(null);
  useSecretKeyword();

  useEffect(() => {
    if (lastAnalyticsPath.current === path) return;
    lastAnalyticsPath.current = path;
    trackPageView(path);
  }, [path]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    if (path !== "/") setHomeLoaderOpen(false);
  }, [path]);

  const renderPage = () => {
    if (path === "/") return <HomePage />;
    if (path === "/shop") return <ShopPage />;
    if (path === "/wishlist" || path === "/favorites" || path === "/saved") return <WishlistPage />;
    if (path === "/contact") return <ContactPage />;
    if (path.startsWith("/track/")) return <TrackOrder />;
    if (path === "/studio" || path === "/admin") return <StudioGate />;
    if (path.startsWith("/product/")) return <ProductPage />;
    return <NotFoundPage />;
  };

  return (
    <div className="flex min-h-screen flex-col bg-bone">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-xs focus:text-bone"
      >
        Skip to content
      </a>
      <ThemeProvider />
      <ScrollProgress />
      <GitHubOAuthHandler />
      <Navbar />
      <main id="main" className="flex-1">
        <Suspense fallback={<RouteFallback />}>{renderPage()}</Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutSheetHost />
      <FloatingWhatsApp />
      <BackToTop />
      {homeLoaderOpen && <HomeLoader onDone={closeHomeLoader} />}
    </div>
  );
}

function CheckoutSheetHost() {
  const { checkoutOpen, closeCheckout } = useCart();
  if (!checkoutOpen) return null;
  return (
    <Suspense fallback={null}>
      <CheckoutSheet open={checkoutOpen} onClose={closeCheckout} />
    </Suspense>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ThemeModeProvider>
        <LanguageProvider>
          <ToastProvider>
            <CartProvider>
              <AppShell />
            </CartProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeModeProvider>
    </StoreProvider>
  );
}
