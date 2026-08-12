import Link from "@/components/site-link";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { href: "/posts", label: "文章" },
  { href: "/categories", label: "栏目" },
  { href: "/tags", label: "标签" },
  { href: "/about", label: "关于" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="site-mark" href="/" aria-label="Kamito's Notes 首页">
          <span className="mark-dot" aria-hidden="true" />
          <span>Kamito&apos;s Notes</span>
        </Link>
        <nav className="primary-nav" aria-label="主导航">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
