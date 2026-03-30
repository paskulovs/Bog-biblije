import Link from "next/link";
import { useEffect, useState } from "react";
import SiteLayout from "../components/SiteLayout";
import VideoCard from "../components/VideoCard";
import {
  DEFAULT_VIDEO_CATEGORY,
  VIDEO_CATEGORY_OPTIONS,
  normalizeVideoCategory,
} from "../lib/content-routes";
import { getVideos } from "../lib/content-store";
import { Video } from "../lib/types";

const VIDEOS_TAKE = 9;

interface VideosPageProps {
  videos: Video[];
  totalVideos: number;
  category: string;
}

export async function getServerSideProps(context: { query: { kategorija?: string } }) {
  const category = normalizeVideoCategory(context.query.kategorija || DEFAULT_VIDEO_CATEGORY);
  const { results, totalItems } = await getVideos({
    take: VIDEOS_TAKE,
    categorySlug: category,
  });

  return {
    props: {
      videos: results,
      totalVideos: totalItems,
      category,
    },
  };
}

export default function VideosPage({ videos, totalVideos, category }: VideosPageProps) {
  const [items, setItems] = useState(videos);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(videos);
    setPage(1);
    setLoading(false);
  }, [videos]);

  const activeOption =
    VIDEO_CATEGORY_OPTIONS.find((option) => option.value === category) || VIDEO_CATEGORY_OPTIONS[0];

  const handleLoadMore = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        take: String(VIDEOS_TAKE),
        categorySlug: category,
      });
      const response = await fetch(`/api/videos?${params.toString()}`);
      const data = await response.json();
      setItems((currentItems) => [...currentItems, ...(data.results || [])]);
      setPage((currentPage) => currentPage + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout
      title="Video | Bog Biblije"
      description="Video materijali, svedočenja i duhovne teme dostupne na sajtu Bog Biblije."
      canonicalUrl={`https://bogbiblije.com/video?kategorija=${category}`}
    >
      <section className="about-section section-padding page-shell">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-12 text-center mb-5">
              <em className="text-white">Video sadržaj</em>
              <h1 className="text-white mt-2 mb-3">Video</h1>
              <p className="text-white mb-4">{activeOption.description}</p>

              <div className="article-filter-row">
                {VIDEO_CATEGORY_OPTIONS.map((option) => (
                  <Link
                    key={option.value}
                    href={{ pathname: "/video", query: { kategorija: option.value } }}
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
                  <h4 className="text-white">Video sadržaj još nije dodat</h4>
                  <p className="text-white mb-0">
                    Kada baza podataka vrati zapise za ovu kategoriju, prikazaće se ovde bez dodatnih
                    izmena na sajtu.
                  </p>
                </div>
              </div>
            ) : null}

            {items.map((video) => (
              <div className="col-lg-4 col-md-6 col-12 mb-4" key={video.id}>
                <VideoCard video={video} />
              </div>
            ))}

            {items.length < totalVideos ? (
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
