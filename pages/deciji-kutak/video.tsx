import Link from "next/link";
import { useEffect, useState } from "react";
import SiteLayout from "../../components/SiteLayout";
import VideoCard from "../../components/VideoCard";
import { CHILD_VIDEO_CATEGORY } from "../../lib/content-routes";
import { getVideos } from "../../lib/content-store";
import { Video } from "../../lib/types";

const CHILD_VIDEOS_TAKE = 9;

interface ChildVideosPageProps {
  videos: Video[];
  totalVideos: number;
}

export async function getServerSideProps() {
  const { results, totalItems } = await getVideos({
    take: CHILD_VIDEOS_TAKE,
    categorySlug: CHILD_VIDEO_CATEGORY,
  });

  return {
    props: {
      videos: results,
      totalVideos: totalItems,
    },
  };
}

export default function ChildVideosPage({ videos, totalVideos }: ChildVideosPageProps) {
  const [items, setItems] = useState(videos);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(videos);
    setPage(1);
    setLoading(false);
  }, [videos]);

  const handleLoadMore = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        take: String(CHILD_VIDEOS_TAKE),
        categorySlug: CHILD_VIDEO_CATEGORY,
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
      title="Dečiji Kutak | Hristova Školica | Bog Biblije"
      description="Video materijali za decu u okviru dečijeg kutka sajta Bog Biblije."
      canonicalUrl="https://bogbiblije.com/deciji-kutak/video"
    >
      <section className="about-section section-padding page-shell">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-12 text-center mb-5">
              <em className="text-white">Dečiji kutak</em>
              <h1 className="text-white mt-2 mb-3">Hristova školica</h1>
              <p className="text-white mb-4">
                Video sadržaj za decu i porodice, u skladu sa vizuelnim jezikom sajta Bog Biblije.
              </p>

              <div className="article-filter-row">
                <Link href="/deciji-kutak/knjige" passHref>
                  <a className="btn custom-btn custom-border-btn">Knjige i priče</a>
                </Link>
                <Link href="/deciji-kutak/video" passHref>
                  <a className="btn custom-btn">Video</a>
                </Link>
              </div>
            </div>

            {!items.length ? (
              <div className="col-lg-8 col-12">
                <div className="content-empty-state">
                  <h4 className="text-white">Dečiji video sadržaj još nije dodat</h4>
                  <p className="text-white mb-0">
                    Čim baza vrati snimke iz dečijeg kutka, pojaviće se na ovoj stranici.
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
