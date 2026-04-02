import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import SearchModal from "./SearchModal";

interface SiteLayoutProps extends PropsWithChildren {
  title?: string;
  description?: string;
  canonicalUrl?: string;
}

const DEFAULT_TITLE =
  "Bog Biblije - Naša Zaštita | Sveta Božija Reč | Besplatna Biblija | Kamp Deca Neba";
const DEFAULT_DESCRIPTION =
  "Bog Biblije - Besplatna distribucija Svetog Pisma, kamp Deca Neba i promovisanje Božije Reči kao jedinog autoriteta u oblasti religije.";

const FOOTER_SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/people/Bog-Biblije/100086580107596/",
    iconClass: "bi-facebook",
    label: "Facebook",
  },
  {
    href: "https://www.instagram.com/bog_biblije/",
    iconClass: "bi-instagram",
    label: "Instagram",
  },
  {
    href: "https://www.tiktok.com/@bogbiblije?_t=8geA8RiIXyf&_r=1",
    iconClass: "bi-tiktok",
    label: "TikTok",
  },
  {
    href: "https://www.youtube.com/@Bog-Biblije",
    iconClass: "bi-youtube",
    label: "YouTube",
  },
  {
    href: "https://invite.viber.com/?g2=AQBEs0H7dv2Qw1Rb9wryec4gHV2nyERWSThNrSFi2vNjcVn1fJmIZUTou4pbn9bE",
    iconClass: "bi-whatsapp",
    label: "Viber",
  },
] as const;

const FOOTER_PHONE_NUMBERS = [
  {
    country: "Srbija",
    href: "tel:+38169646064",
    value: "+381 69 64 60 64",
  },
  {
    country: "Crna Gora",
    href: "tel:+38267031818",
    value: "+382 67 03 18 18",
  },
  {
    country: "BiH",
    href: "tel:+38763733594",
    value: "+387 63 73 35 94",
  },
  {
    country: "Hrvatska",
    href: "tel:+385977076126",
    value: "+385 97 70 76 126",
  },
] as const;

export default function SiteLayout({
  children,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
}: SiteLayoutProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const stickyWrapperRef = useRef<HTMLDivElement | null>(null);
  const isHomePage = router.pathname === "/";
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!isHomePage) {
      setIsSticky(false);
      return undefined;
    }

    const onScroll = () => {
      setIsSticky(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  useEffect(() => {
    const syncHeaderHeight = () => {
      const headerHeight = stickyWrapperRef.current?.getBoundingClientRect().height ?? 0;
      document.documentElement.style.setProperty("--site-header-height", `${Math.ceil(headerHeight)}px`);
    };

    syncHeaderHeight();
    window.addEventListener("resize", syncHeaderHeight);

    return () => {
      window.removeEventListener("resize", syncHeaderHeight);
      document.documentElement.style.removeProperty("--site-header-height");
    };
  }, [isSticky, menuOpen, router.pathname]);

  const closeMenu = () => setMenuOpen(false);
  const openSearch = () => {
    closeMenu();
    setSearchOpen(true);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        <meta name="keywords" content="Bog Biblije, Sveto Pismo, Biblija, članci, vera, religija" />
        <meta name="author" content="Bog Biblije" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="https://bogbiblije.com/images/share-image.png" />
        <meta property="og:site_name" content="Bog Biblije" />
        <meta property="og:locale" content="sr_RS" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://bogbiblije.com/images/share-image.png" />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      </Head>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <div
        ref={stickyWrapperRef}
        className={`sticky-wrapper ${isHomePage ? "sticky-wrapper-home" : ""} ${
          isSticky ? "is-sticky" : ""
        }`}
      >
        <nav className="navbar navbar-expand-xl" aria-label="Glavna navigacija">
          <div className="container">
            <Link href="/" passHref>
              <a className="navbar-brand d-flex align-items-center">
                <img
                  src="/images/logo_small.png"
                  className="navbar-brand-image img-fluid"
                  alt="Bog Biblije logo"
                />
                Bog Biblije
              </a>
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              aria-controls="navbarNav"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen((currentValue) => !currentValue)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`} id="navbarNav">
              <ul className="navbar-nav ms-xl-auto">
                <li className="nav-item">
                  <Link href="/clanci" passHref>
                    <a className="nav-link smoothscroll" onClick={closeMenu}>
                      Blog
                    </a>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link href="/knjige" passHref>
                    <a className="nav-link smoothscroll" onClick={closeMenu}>
                      Knjige
                    </a>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link href="/video" passHref>
                    <a className="nav-link smoothscroll" onClick={closeMenu}>
                      Video
                    </a>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link href="/deciji-kutak/knjige" passHref>
                    <a className="nav-link smoothscroll" onClick={closeMenu}>
                      Dečiji kutak
                    </a>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link href="/#o-nama" passHref>
                    <a className="nav-link smoothscroll" onClick={closeMenu}>
                      O nama
                    </a>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link href="/#kontakt" passHref>
                    <a className="nav-link smoothscroll" onClick={closeMenu}>
                      Kontakt
                    </a>
                  </Link>
                </li>
              </ul>

              <div className="ms-xl-3">
                <button type="button" className="btn custom-btn custom-border-btn" onClick={openSearch}>
                  Pretraga
                  <i className="bi-search ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <main>{children}</main>

      <footer className="site-footer" id="kontakt" aria-label="Kontakt informacije">
        <div className="container">
          <div className="footer-shell">
            <div className="row g-4 g-xl-5 align-items-stretch">
              <div className="col-xl-5 col-lg-12">
                <div className="footer-intro">
                  <span className="footer-eyebrow">Kontakt</span>
                  <h2 className="footer-title">Kontaktirajte nas</h2>
                  <p className="footer-description">
                    Možete nas kontaktirati putem naloga na društvenim mrežama, putem telefona ili putem email-a.
                  </p>
                  <br/>
                  <ul className="social-icon footer-social" aria-label="Društvene mreže">
                    {FOOTER_SOCIAL_LINKS.map((socialLink) => (
                      <li className="social-icon-item" key={socialLink.label}>
                        <a
                          href={socialLink.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`social-icon-link ${socialLink.iconClass}`}
                          aria-label={socialLink.label}
                        ></a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-xl-3 col-lg-5 col-md-6">
                <div className="footer-card footer-contact-card">
                  <span className="footer-label">Email</span>
                  <br/>
                  <br/>
                  <a href="mailto:bogbilije@gmail.com" className="site-footer-link footer-email-link">
                    bogbilije@gmail.com
                  </a>
                  <p className="footer-card-text">
                    Pišite nam za dodatne informacije, naručivanje knjiga ili pitanja u vezi sa
                    sadržajem sajta.
                  </p>
                </div>
              </div>

              <div className="col-xl-4 col-lg-7 col-md-6">
                <div className="footer-card footer-phone-card">
                  <div className="footer-card-head">
                    <span className="footer-label mb-0">Telefon</span>
                  </div>

                  <ul className="footer-phone-list">
                    {FOOTER_PHONE_NUMBERS.map((phoneNumber) => (
                      <li className="footer-phone-item" key={phoneNumber.country}>
                        <span className="country-name">{phoneNumber.country}</span>
                        <strong>
                          <a href={phoneNumber.href} className="site-footer-link footer-phone-link">
                            {phoneNumber.value}
                          </a>
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <p className="copyright-text mb-0">Copyright © Bog Biblije</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
