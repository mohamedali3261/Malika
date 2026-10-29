import { TrackOrder } from "@/pages/TrackOrder";
import { GitHubOAuthHandler } from "@/components/GitHubOAuthHandler";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { CheckoutSheet } from "@/components/cart/CheckoutSheet";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { useSecretKeyword } from "@/components/layout/SecretEntry";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CartProvider, useCart } from "@/context/CartContext";
import { StoreProvider } from "@/context/StoreContext";
import { ToastProvider } from "@/context/ToastContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { useRoute } from "@/lib/router";
import { AboutPage } from "@/pages/About";
import { StudioGate } from "@/pages/Admin/StudioGate";
import { ContactPage } from "@/pages/Contact";
import { HomePage } from "@/pages/Home";
import { NotFoundPage } from "@/pages/NotFound/NotFoundPage";
import { ProductPage } from "@/pages/Product";
import { ShopPage } from "@/pages/Shop";
import { useEffect } from "react";

function AppShell() {
  const { path } = useRoute();
  useSecretKeyword();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [path]);

  const showTabBar = !path.startsWith("/studio") && !path.startsWith("/admin") && !path.startsWith("/product/");

  const renderPage = () => {
    if (path === "/") return <HomePage />;
    if (path === "/shop") return <ShopPage />;
    if (path === "/about") return <AboutPage />;
    if (path === "/contact") return <ContactPage />;
    if (path.startsWith("/track/")) return <TrackOrder />;
    if (path === "/studio" || path === "/admin") return <StudioGate />;
    if (path.startsWith("/product/")) return <ProductPage />;
    return <NotFoundPage />;
  };

  return (
    <div className={showTabBar ? "flex min-h-screen flex-col bg-bone pb-[76px] lg:pb-0" : "flex min-h-screen flex-col bg-bone"}>
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
        {renderPage()}
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutSheetHost />
      <MobileTabBar />
      <FloatingWhatsApp />
    </div>
  );
}

function CheckoutSheetHost() {
  const { checkoutOpen, closeCheckout } = useCart();
  return <CheckoutSheet open={checkoutOpen} onClose={closeCheckout} />;
}

export default function App() {
  return (
    // StoreProvider is outermost: LanguageProvider reads the owner's text edits
    // from it, and the store itself needs nothing from the language.
    <StoreProvider>
      <LanguageProvider>
        <ToastProvider>
          <CartProvider>
            <AppShell />
          </CartProvider>
        </ToastProvider>
      </LanguageProvider>
    </StoreProvider>
  );
}
