import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { getArticlePath } from "../lib/content-routes";
import { Book, SearchResult } from "../lib/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_RESULTS: SearchResult = {
  blogPosts: [],
  books: [],
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>(EMPTY_RESULTS);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults(EMPTY_RESULTS);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        params.set("searchText", query);

        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Search request failed.");
        }

        const data = (await response.json()) as SearchResult;
        setResults(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults(EMPTY_RESULTS);
        }
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, query]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.body.classList.add("search-modal-open");
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("search-modal-open");
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  const handleBookClick = async (book: Book) => {
    onClose();

    if (book.pdfUrl) {
      window.open(book.pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }

    await router.push("/knjige?tip=free-books");
  };

  const hasResults = results.blogPosts.length > 0 || results.books.length > 0;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="search-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="search-modal-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Pretraga sadržaja"
      >
        <div className="search-modal-header">
          <div>
            <p className="search-modal-kicker">Pretraga sadržaja</p>
            <h3 className="search-modal-title">Članci i knjige</h3>
          </div>

          <button type="button" className="search-modal-close" onClick={onClose}>
            <i className="bi-x-lg"></i>
          </button>
        </div>

        <div className="search-modal-input-wrap">
          <i className="bi-search search-modal-input-icon"></i>
          <input
            ref={inputRef}
            type="search"
            className="search-modal-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pretražite naslove članaka i knjiga..."
          />
        </div>

        <div className="search-modal-meta">
          {isLoading ? "Učitavanje rezultata..." : query ? "Rezultati pretrage" : "Najnoviji sadržaj"}
        </div>

        <div className="search-modal-results">
          {results.blogPosts.length ? (
            <div className="search-modal-group">
              <p className="search-modal-group-title">Članci</p>
              {results.blogPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  className="search-result-button"
                  onClick={async () => {
                    onClose();
                    await router.push(getArticlePath(post));
                  }}
                >
                  <span className="search-result-label">{post.title}</span>
                  <span className="search-result-description">{post.excerpt}</span>
                </button>
              ))}
            </div>
          ) : null}

          {results.books.length ? (
            <div className="search-modal-group">
              <p className="search-modal-group-title">Knjige</p>
              {results.books.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  className="search-result-button"
                  onClick={() => handleBookClick(book)}
                >
                  <span className="search-result-label">{book.title}</span>
                  <span className="search-result-description">
                    {book.author}
                    {book.pdfUrl ? " · PDF" : " · Besplatna knjiga"}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {!isLoading && !hasResults ? (
            <div className="content-empty-state search-empty-state">
              <h4 className="text-white">Nema rezultata</h4>
              <p className="text-white mb-0">
                Pokušajte sa drugim pojmom ili otvorite stranicu sa knjigama i člancima.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
