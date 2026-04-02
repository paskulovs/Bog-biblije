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
                  <Link href="/#section_5" passHref>
                    <a className="nav-link smoothscroll" onClick={closeMenu}>
                      O nama
                    </a>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link href="/#section_6" passHref>
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

      <footer className="site-footer" id="section_6" aria-label="Kontakt informacije">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-12 me-auto">
              <em className="text-white d-block mb-4">Gde nas možete naći?</em>

              <strong className="text-white">
                Možete nas kontaktirati putem naloga na društvenim mrežama, putem telefona ili putem
                email-a.
              </strong>

              <ul className="social-icon mt-4">
                <li className="social-icon-item me-3">
                  <a
                    href="https://www.facebook.com/people/Bog-Biblije/100086580107596/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon-link bi-facebook"
                  ></a>
                </li>

                <li className="social-icon-item me-3">
                  <a
                    href="https://www.instagram.com/bog_biblije/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon-link bi-instagram"
                  ></a>
                </li>

                <li className="social-icon-item me-3">
                  <a
                    href="https://www.tiktok.com/@bogbiblije?_t=8geA8RiIXyf&_r=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon-link bi-tiktok"
                  ></a>
                </li>

                <li className="social-icon-item me-3">
                  <a
                    href="https://www.youtube.com/@Bog-Biblije"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon-link bi-youtube"
                  ></a>
                </li>

                <li className="social-icon-item me-3">
                  <a
                    href="https://invite.viber.com/?g2=AQBEs0H7dv2Qw1Rb9wryec4gHV2nyERWSThNrSFi2vNjcVn1fJmIZUTou4pbn9bE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon-link bi-whatsapp"
                  ></a>
                </li>
              </ul>
            </div>

            <div className="col-lg-3 col-12 mt-4 mb-3 mt-lg-0 mb-lg-0">
              <em className="text-white d-block mb-4">Email</em>

              <p className="d-flex">
                <strong className="me-2">
                  <a href="mailto:bogbilije@gmail.com" className="site-footer-link">
                    bogbilije@gmail.com
                  </a>
                </strong>
              </p>
            </div>

            <div className="col-lg-5 col-12">
              <em className="text-white d-block mb-4">Telefon</em>

              <ul className="opening-hours-list">
                <li className="d-flex">
                  <span className="country-name">Srbija</span>
                  <strong>
                    <a href="tel:+38169646064" className="site-footer-link">
                      +381 69 64 60 64
                    </a>
                  </strong>
                </li>

                <li className="d-flex">
                  <span className="country-name">Crna Gora</span>
                  <strong>
                    <a href="tel:+38267031818" className="site-footer-link">
                      +382 67 03 18 18
                    </a>
                  </strong>
                </li>

                <li className="d-flex">
                  <span className="country-name">BiH</span>
                  <strong>
                    <a href="tel:+38763733594" className="site-footer-link">
                      +387 63 73 35 94
                    </a>
                  </strong>
                </li>

                <li className="d-flex">
                  <span className="country-name">Hrvatska</span>
                  <strong>
                    <a href="tel:+385977076126" className="site-footer-link">
                      +385 97 70 76 126
                    </a>
                  </strong>
                </li>
              </ul>
            </div>

            <div className="col-lg-8 col-12 mt-4">
              <p className="copyright-text mb-0">Copyright © Bog Biblije 2025</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
