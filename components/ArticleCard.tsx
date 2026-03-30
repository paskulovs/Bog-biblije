import Link from "next/link";
import { getArticlePath } from "../lib/content-routes";
import { ReadableArticle } from "../lib/types";

interface ArticleCardProps {
  article: ReadableArticle;
  small?: boolean;
}

export default function ArticleCard({ article, small = false }: ArticleCardProps) {
  return (
    <Link href={getArticlePath(article)} passHref>
      <a
        className={`blog-section-wrap d-block article-card ${
          small ? "article-card-small" : "article-card-standard"
        }`}
      >
        <div className="blog-section-info d-flex flex-column">
          <div className="d-flex mt-auto mb-3">
            <h4 className="text-white mb-0">{article.title}</h4>
          </div>

          <p className="text-white mb-0">{article.excerpt}</p>
        </div>

        <div className="blog-section-image-wrap">
          <img
            src={article.imageUrl}
            className="blog-section-image img-fluid"
            alt={article.title}
          />
        </div>
      </a>
    </Link>
  );
}
