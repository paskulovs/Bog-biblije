import Link from "next/link";
import { useEffect, useState } from "react";
import ArticleCard from "../../components/ArticleCard";
import SiteLayout from "../../components/SiteLayout";
import { getBlogPosts } from "../../lib/content-store";
import { ReadableArticle } from "../../lib/types";

const CHILD_BOOKS_TAKE = 9;

interface ChildBooksPageProps {
  posts: ReadableArticle[];
  totalPosts: number;
}

export async function getServerSideProps() {
  const { results, totalItems } = await getBlogPosts({
    take: CHILD_BOOKS_TAKE,
    isChildCorner: true,
  });

  return {
    props: {
      posts: results,
      totalPosts: totalItems,
    },
  };
}

export default function ChildBooksPage({ posts, totalPosts }: ChildBooksPageProps) {
  const [items, setItems] = useState(posts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(posts);
    setPage(1);
    setLoading(false);
  }, [posts]);

  const handleLoadMore = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        take: String(CHILD_BOOKS_TAKE),
        isChildCorner: "true",
      });
      const response = await fetch(`/api/blog-posts?${params.toString()}`);
      const data = await response.json();
      setItems((currentItems) => [...currentItems, ...(data.results || [])]);
      setPage((currentPage) => currentPage + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout
      title="Dečiji Kutak | Biblija za decu | Bog Biblije"
      description="Priče i biblijski sadržaji za decu u okviru projekta Bog Biblije."
      canonicalUrl="https://bogbiblije.com/deciji-kutak/knjige"
    >
      <section className="about-section section-padding page-shell">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-12 text-center mb-5">
              <em className="text-white">Dečiji kutak</em>
              <h1 className="text-white mt-2 mb-3">Biblija za decu</h1>
              <p className="text-white mb-4">
                Sadržaj namenjen mlađima, prilagođen jeziku dece i porodice.
              </p>

              <div className="article-filter-row">
                <Link href="/deciji-kutak/knjige" passHref>
                  <a className="btn custom-btn">Knjige i priče</a>
                </Link>
                <Link href="/deciji-kutak/video" passHref>
                  <a className="btn custom-btn custom-border-btn">Video</a>
                </Link>
              </div>
            </div>

            {!items.length ? (
              <div className="col-lg-8 col-12">
                <div className="content-empty-state">
                  <h4 className="text-white">Dečiji članci još nisu dodati</h4>
                  <p className="text-white mb-0">
                    Kada zapisi iz dečijeg kutka budu dostupni u bazi, pojaviće se upravo na ovoj
                    stranici.
                  </p>
                </div>
              </div>
            ) : null}

            {items.map((post) => (
              <div className="col-lg-4 col-md-6 col-12 mb-4" key={post.id}>
                <ArticleCard article={post} />
              </div>
            ))}

            {items.length < totalPosts ? (
              <div className="col-12">
                <div className="load-more-row">
                  <button
                    type="button"
                    className="btn custom-btn custom-border-btn"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? "Učitavanje..." : "Učitaj još"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
