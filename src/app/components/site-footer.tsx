import { Link } from "react-router";
import { ChefHat } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid place-items-center size-9 rounded-full bg-primary text-primary-foreground">
              <ChefHat className="size-5" />
            </span>
            <span className="font-display" style={{ fontSize: "1.35rem" }}>Larder</span>
          </Link>
          <p className="text-muted-foreground mt-4 max-w-xs" style={{ fontSize: "0.88rem" }}>
            A warm corner of the internet where cooks share the recipes they actually make — and home cooks find their next favourite.
          </p>
        </div>
        {[
          { title: "Discover", links: ["Explore", "Trending", "Categories", "Collections"] },
          { title: "For Cooks", links: ["Publish a recipe", "Creator studio", "Guidelines", "Community"] },
          { title: "Company", links: ["About", "Journal", "Careers", "Contact"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-display" style={{ fontSize: "0.95rem" }}>{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <a className="text-muted-foreground hover:text-foreground transition-colors" style={{ fontSize: "0.85rem" }} href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-muted-foreground" style={{ fontSize: "0.8rem" }}>
          <span>© {new Date().getFullYear()} Larder. Made for people who love to cook.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
