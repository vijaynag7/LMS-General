import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold">
          EduSaaS
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={`${APP_URL}/login`} className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </a>
          <a
            href={`${APP_URL}/onboard`}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
