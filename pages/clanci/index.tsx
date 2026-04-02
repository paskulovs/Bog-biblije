import Link from "next/link";
import ArticleCard from "../../components/ArticleCard";
import SiteLayout from "../../components/SiteLayout";
import { getAllArticles } from "../../lib/article-store";
import { getBlogPosts } from "../../lib/content-store";
import { ReadableArticle } from "../../lib/types";

interface ArticlesPageProps {
  articles: ReadableArticle[];
  sort: "newest" | "popular";
}

export async function getServerSideProps(context: { query: { sort?: string } }) {
  const sort = context.query.sort === "popular" ? "popular" : "newest";
  const databaseArticles = await getBlogPosts({
    take: 60,
    sort: sort === "popular" ? "desc,readCount" : "desc,createdAt",
    isChildCorner: false,
  });
  const allArticles = databaseArticles.results.length
    ? databaseArticles.results
    : await getAllArticles();
  const articles =
    databaseArticles.results.length || sort === "newest"
      ? allArticles
      : [...allArticles].sort((left, right) => right.readCount - left.readCount);

  return {
    props: {
      articles,
      sort,
    },
  };
}

export default function ArticlesPage({ articles, sort }: ArticlesPageProps) {
  return (
    <SiteLayout
      title="Članci | Bog Biblije"
      description="Pregled svih članaka objavljenih na sajtu Bog Biblije."
      canonicalUrl="https://bogbiblije.com/clanci"
    >
      <section className="about-section section-padding page-shell">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-12 text-center mb-5">
              <em className="text-white">U potrazi za mudrošću</em>
              <h2 className="text-white mt-2 mb-3">Svi članci</h2>
              <p className="text-white mb-4">
                Tekstovi, svedočenja i biblijske teme dostupni su na jednom mestu, uz isti vizuelni
                jezik koji već koristi početna strana sajta.
              </p>

              <div className="article-filter-row">
                <Link href="/clanci?sort=newest" passHref>
                  <a className={`btn custom-btn ${sort === "newest" ? "" : "custom-border-btn"}`}>
                    Najnovije
                  </a>
                </Link>
                <Link href="/clanci?sort=popular" passHref>
                  <a className={`btn custom-btn ${sort === "popular" ? "" : "custom-border-btn"}`}>
                    Najčitanije
                  </a>
                </Link>
              </div>
            </div>

            {!articles.length ? (
              <div className="col-lg-8 col-12">
                <div className="content-empty-state">
                  <h4 className="text-white">Članci će uskoro biti dostupni</h4>
                  <p className="text-white mb-0">
                    Kada sadržaj bude sinhronizovan sa bazom podataka, ovde će se automatski pojaviti
                    nove objave.
                  </p>
                </div>
              </div>
            ) : null}

            {articles.map((article) => (
              <div className="col-lg-4 col-md-6 col-12 mb-4 article-card-column" key={article.id}>
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
