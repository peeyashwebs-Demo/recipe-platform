import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router";
import { StoreProvider } from "./store";
import { AuthUIProvider } from "./components/auth-ui";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { FeedbackButton } from "./components/feedback-button";
import { AnnotationTool } from "./components/annotation-tool";
import { Toaster } from "./components/ui/sonner";
import { HomePage } from "./pages/home";
import { ExplorePage } from "./pages/explore";
import { RecipePage } from "./pages/recipe";
import { CollectionsPage } from "./pages/collections";
import { CreatorPage } from "./pages/creator";
import { AdminPage } from "./pages/admin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [pathname]);
  return null;
}

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ScrollToTop />
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <FeedbackButton />
      <AnnotationTool />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AuthUIProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/recipe/:id" element={<RecipePage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/creator" element={<CreatorPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<HomePage />} />
            </Route>
          </Routes>
        </AuthUIProvider>
      </BrowserRouter>
      <Toaster position="bottom-center" />
    </StoreProvider>
  );
}
