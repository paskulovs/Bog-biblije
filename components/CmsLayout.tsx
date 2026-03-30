import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";

const CMS_NAV_ITEMS = [
  { href: "/cms", label: "Pregled" },
  { href: "/cms/clanci", label: "Članci" },
  { href: "/cms/knjige", label: "Knjige" },
  { href: "/cms/video", label: "Video" },
];

interface CmsLayoutProps extends PropsWithChildren {
  title?: string;
}

export default function CmsLayout({ children, title = "CMS | Bog Biblije" }: CmsLayoutProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="cms-shell">
        <aside className="cms-shell-sidebar">
          <Link href="/" passHref>
            <a className="cms-shell-brand">
              <img src="/images/logo_small.png" alt="Bog Biblije" className="cms-shell-brand-logo" />
              <span>Bog Biblije CMS</span>
            </a>
          </Link>

          <nav className="cms-shell-nav" aria-label="CMS navigacija">
            {CMS_NAV_ITEMS.map((item) => (
              <Link href={item.href} passHref key={item.href}>
                <a
                  className={`cms-shell-link ${
                    router.pathname === item.href ? "is-active" : ""
                  }`}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="cms-shell-main">
          <header className="cms-shell-header">
            <Link href="/" passHref>
              <a className="btn custom-btn custom-border-btn">Nazad na sajt</a>
            </Link>
          </header>

          <main className="cms-shell-content">{children}</main>
        </div>
      </div>
    </>
  );
}
