import Link from "next/link";
import { requireCmsPageAuth } from "../../lib/auth";

const CMS_LINKS = [
  {
    href: "/cms/clanci",
    title: "Članci",
    description: "Upravljanje objavama koje se prikazuju kao članci na sajtu.",
  },
  {
    href: "/cms/knjige",
    title: "Knjige",
    description: "Dodavanje i uređivanje PDF i besplatnih knjiga iz zajedničke baze.",
  },
  {
    href: "/cms/video",
    title: "Video",
    description: "Upravljanje video zapisima, kategorijama i YouTube oznakama.",
  },
];

export default function CmsHomePage() {
  return (
    <section className="cms-admin-page">
      <div className="cms-admin-intro">
        <h1 className="text-white mb-3">CMS pregled</h1>
        <p className="text-white mb-0">
          Tabele i forme prate strukturu iz referentnog projekta, ali su uklopljene u postojeći
          vizuelni identitet sajta Bog Biblije.
        </p>
      </div>

      <div className="cms-dashboard-grid">
        {CMS_LINKS.map((item) => (
          <div className="cms-dashboard-card" key={item.href}>
            <h3 className="text-white">{item.title}</h3>
            <p className="text-white mb-4">{item.description}</p>
            <Link href={item.href} passHref>
              <a className="btn custom-btn custom-border-btn">Otvori</a>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export const getServerSideProps = requireCmsPageAuth;
