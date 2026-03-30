import Link from "next/link";
import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import SiteLayout from "../components/SiteLayout";
import {
  BOOK_CATEGORY_OPTIONS,
  DEFAULT_BOOK_CATEGORY,
  normalizeBookCategory,
} from "../lib/content-routes";
import { getBooks } from "../lib/content-store";
import { Book } from "../lib/types";

const BOOKS_TAKE = 9;

interface BooksPageProps {
  books: Book[];
  totalBooks: number;
  category: string;
}

export async function getServerSideProps(context: { query: { tip?: string } }) {
  const category = normalizeBookCategory(context.query.tip);
  const { results, totalItems } = await getBooks({
    take: BOOKS_TAKE,
    category,
  });

  return {
    props: {
      books: results,
      totalBooks: totalItems,
      category,
    },
  };
}

export default function BooksPage({ books, totalBooks, category }: BooksPageProps) {
  const [items, setItems] = useState(books);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(books);
    setPage(1);
    setLoading(false);
  }, [books]);

  const activeOption =
    BOOK_CATEGORY_OPTIONS.find((option) => option.value === category) || BOOK_CATEGORY_OPTIONS[0];

  const handleLoadMore = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        take: String(BOOKS_TAKE),
        category,
      });
      const response = await fetch(`/api/books?${params.toString()}`);
      const data = await response.json();
      setItems((currentItems) => [...currentItems, ...(data.results || [])]);
      setPage((currentPage) => currentPage + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout
      title="Knjige | Bog Biblije"
      description="PDF izdanja i besplatne knjige dostupne kroz projekat Bog Biblije."
      canonicalUrl={`https://bogbiblije.com/knjige?tip=${category}`}
    >
      <section className="about-section section-padding page-shell">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-12 text-center mb-5">
              <em className="text-white">Sveta Božija Reč i korisna literatura</em>
              <h1 className="text-white mt-2 mb-3">Knjige</h1>
              <p className="text-white mb-4">{activeOption.description}</p>

              <div className="article-filter-row">
                {BOOK_CATEGORY_OPTIONS.map((option) => (
                  <Link
                    key={option.value}
                    href={{ pathname: "/knjige", query: { tip: option.value } }}
                    passHref
                  >
                    <a
                      className={`btn custom-btn ${
                        option.value === category ? "" : "custom-border-btn"
                      }`}
                    >
                      {option.label}
                    </a>
                  </Link>
                ))}
              </div>
            </div>

            {!items.length ? (
              <div className="col-lg-8 col-12">
                <div className="content-empty-state">
                  <h4 className="text-white">Trenutno nema dostupnih knjiga</h4>
                  <p className="text-white mb-0">
                    Kada sadržaj iz baze bude dostupan, ovde će se automatski prikazati sva aktuelna
                    izdanja.
                  </p>
                </div>
              </div>
            ) : null}

            {items.map((book) => (
              <div className="col-lg-4 col-md-6 col-12 mb-4" key={book.id}>
                <BookCard book={book} />
              </div>
            ))}

            {items.length < totalBooks ? (
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
