import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import ArticleCard from "../../components/ArticleCard";
import SiteLayout from "../../components/SiteLayout";
import {
  getArticleBySlug,
  getMostReadArticles,
} from "../../lib/article-store";
import { getArticleIdFromSlugParam, getArticlePath } from "../../lib/content-routes";
import { getBlogPostById, getMostReadBlogPosts } from "../../lib/content-store";
import { formatSerbianDate } from "../../lib/date";
import { ReadableArticle } from "../../lib/types";

interface ArticleDetailsPageProps {
  article: ReadableArticle;
  mostReadArticles: ReadableArticle[];
}

export async function getServerSideProps(context: { params?: { slug?: string } }) {
  const slug = context.params?.slug;
  if (!slug) {
    return { notFound: true };
  }

  const databaseArticle = await getBlogPostById(getArticleIdFromSlugParam(slug));
  if (databaseArticle) {
    const mostReadArticles = await getMostReadBlogPosts(4, databaseArticle.id, false);

    return {
      props: {
        article: databaseArticle,
        mostReadArticles,
      },
    };
  }

  const article = await getArticleBySlug(slug);
  if (!article) {
    return { notFound: true };
  }
  const mostReadArticles = await getMostReadArticles(4, article.id);

  return {
    props: {
      article,
      mostReadArticles,
    },
  };
}

export default function ArticleDetailsPage({
  article,
  mostReadArticles,
}: ArticleDetailsPageProps) {
  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const endpoint = article.slug ? `/api/articles/${article.id}` : `/api/blog-posts/${article.id}`;

      fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incrementReadCount: true }),
      }).catch(() => null);
    }, 15000);

    return () => window.clearTimeout(timerId);
  }, [article.id]);

  return (
    <SiteLayout
      title={`${article.title} | Bog Biblije`}
      description={article.excerpt}
      canonicalUrl={`https://bogbiblije.com${getArticlePath(article)}`}
    >
      <Head>
        <meta property="og:type" content="article" />
      </Head>

      <section className="about-section section-padding page-shell">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-10 col-12 text-center">
              <em className="text-white">Članak</em>
              <h1 className="text-white article-title mb-3">{article.title}</h1>
              <p className="text-white article-summary">{article.excerpt}</p>
              <p className="article-meta-line">
                {formatSerbianDate(article.createdAt)} · {article.author}
              </p>
            </div>
          </div>

          <div className="row g-4 align-items-start">
            <div className="col-lg-8 col-12">
              <div className="article-detail-card">
                <img src={article.imageUrl} alt={article.title} className="article-detail-image" />

                {article.audioUrl ? (
                  <div className="article-audio-wrap">
                    <audio controls preload="none">
                      <source src={article.audioUrl} />
                    </audio>
                  </div>
                ) : null}

                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>

            <div className="col-lg-4 col-12">
              <aside className="article-sidebar">
                <h4 className="text-white mb-4">Najčitaniji članci</h4>

                <div className="article-sidebar-grid">
                  {mostReadArticles.map((relatedArticle) => (
                    <ArticleCard key={relatedArticle.id} article={relatedArticle} small />
                  ))}
                </div>

                <div className="article-sidebar-actions">
                  <Link href="/clanci" passHref>
                    <a className="btn custom-btn custom-border-btn">Nazad na članke</a>
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
