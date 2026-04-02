import Link from "next/link";
import { getBookCtaHref } from "../lib/content-routes";
import { Book } from "../lib/types";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const hasPdf = Boolean(book.pdfUrl);

  return (
    <article className="content-card content-card-book">
      <div className="content-card-media">
        <img src={book.imageUrl} alt={book.title} className="content-card-image" />
      </div>

      <div className="content-card-body">
        <span className="content-card-tag">{hasPdf ? "PDF izdanje" : "Besplatna knjiga"}</span>
        <p className="content-card-meta">{book.author}</p>
        <h3 className="content-card-title">{book.title}</h3>

        <p className="content-card-description">
          {book.description ||
            (hasPdf
              ? "Klikom na dugme možete odmah otvoriti i preuzeti digitalno izdanje."
              : "Za slanje štampanog izdanja pišite nam putem kontakata sa sajta.")}
        </p>

        <div className="content-card-actions">
          <a
            href={getBookCtaHref(book)}
            target={hasPdf ? "_blank" : undefined}
            rel={hasPdf ? "noopener noreferrer" : undefined}
            className="btn custom-btn custom-border-btn"
          >
            {hasPdf ? "Preuzmi PDF" : "Zatraži knjigu"}
          </a>

          {!hasPdf ? (
            <Link href="/#kontakt" passHref>
              <a className="btn custom-btn">Kontakt</a>
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
