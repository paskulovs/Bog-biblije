import Head from "next/head";
import HomePage from "../components/HomePage";
import SiteLayout from "../components/SiteLayout";
import { getLatestArticles as getLocalLatestArticles } from "../lib/article-store";
import { getLatestBlogPosts } from "../lib/content-store";
import { ReadableArticle } from "../lib/types";

interface HomeProps {
  latestArticles: ReadableArticle[];
}

export async function getServerSideProps() {
  const latestDatabaseArticles = await getLatestBlogPosts(4, false);
  const latestArticles = latestDatabaseArticles.length
    ? latestDatabaseArticles
    : await getLocalLatestArticles(4);

  return {
    props: {
      latestArticles,
    },
  };
}

export default function Home({ latestArticles }: HomeProps) {
  return (
    <SiteLayout canonicalUrl="https://bogbiblije.com/">
      <Head>
        <link rel="preload" as="image" href="/images/bible_giving.jpg" />
        <link rel="preload" as="image" href="/images/kamp_classroom.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Bog Biblije",
              url: "https://bogbiblije.com",
              logo: "https://bogbiblije.com/images/logo_small.png",
              description:
                "Grupa ljudi posvećena promovisanju Svetog Pisma kao jedinog autoriteta u oblasti religije. Besplatna distribucija Biblije i organizacija kampa Deca Neba.",
              email: "bogbilije@gmail.com",
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+381-69-646-064",
                  contactType: "customer service",
                  areaServed: "RS",
                  availableLanguage: "Serbian",
                },
                {
                  "@type": "ContactPoint",
                  telephone: "+382-67-031-818",
                  contactType: "customer service",
                  areaServed: "ME",
                  availableLanguage: "Serbian",
                },
                {
                  "@type": "ContactPoint",
                  telephone: "+387-63-733-594",
                  contactType: "customer service",
                  areaServed: "BA",
                  availableLanguage: "Serbian",
                },
                {
                  "@type": "ContactPoint",
                  telephone: "+385-97-707-6126",
                  contactType: "customer service",
                  areaServed: "HR",
                  availableLanguage: "Serbian",
                },
              ],
              sameAs: [
                "https://www.facebook.com/people/Bog-Biblije/100086580107596/",
                "https://www.instagram.com/bog_biblije/",
                "https://www.tiktok.com/@bogbiblije",
                "https://www.youtube.com/@Bog-Biblije",
              ],
            }),
          }}
        />
      </Head>

      <HomePage latestArticles={latestArticles} />
    </SiteLayout>
  );
}
