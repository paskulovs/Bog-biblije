import { FormEvent, useEffect, useState } from "react";
import CmsModal from "../../../components/CmsModal";
import CmsPagination from "../../../components/CmsPagination";
import { requireCmsPageAuth } from "../../../lib/auth";
import { Video, VideoInput } from "../../../lib/types";

type VideoSourceFilter = "all" | "true" | "false";

const VIDEO_CATEGORY_OPTIONS = [
  { value: "", label: "Sve kategorije" },
  { value: "licna-iskustva", label: "Lična iskustva" },
  { value: "duhovne-teme", label: "Duhovne teme" },
  { value: "filmovi", label: "Biblijski filmovi" },
  { value: "djeciji-kutak", label: "Dečiji kutak" },
  { value: "komentari-biblije", label: "Komentari Biblije" },
];

const EMPTY_FORM: VideoInput = {
  title: "",
  url: "",
  imageUrl: "",
  categorySlug: "licna-iskustva",
  isYouTube: false,
};

interface VideosResponse {
  results: Video[];
  totalItems: number;
}

export default function CmsVideosPage() {
  const [items, setItems] = useState<Video[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [draftFilters, setDraftFilters] = useState({
    title: "",
    categorySlug: "",
    isYouTube: "all" as VideoSourceFilter,
  });
  const [appliedFilters, setAppliedFilters] = useState(draftFilters);
  const [formState, setFormState] = useState<VideoInput>(EMPTY_FORM);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          take: String(pageSize),
          title: appliedFilters.title,
        });

        if (appliedFilters.categorySlug) {
          params.set("categorySlug", appliedFilters.categorySlug);
        }
        if (appliedFilters.isYouTube !== "all") {
          params.set("isYouTube", appliedFilters.isYouTube);
        }

        const response = await fetch(`/api/videos?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load videos.");
        }

        const data = (await response.json()) as VideosResponse;

        if (controller.signal.aborted) {
          return;
        }

        setItems(data.results || []);
        setTotalItems(data.totalItems || 0);
      } catch (error) {
        if (controller.signal.aborted || (error as Error).name === "AbortError") {
          return;
        }

        throw error;
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => controller.abort();
  }, [page, pageSize, appliedFilters, refreshToken]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormState(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = async (id: string) => {
    const response = await fetch(`/api/videos/${id}`);
    const data = (await response.json()) as Video;

    setEditingId(id);
    setFormState({
      title: data.title,
      url: data.url,
      imageUrl: data.imageUrl,
      categorySlug: data.categorySlug,
      isYouTube: data.isYouTube,
    });
    setModalOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveLoading(true);

    try {
      const response = await fetch(editingId ? `/api/videos/${editingId}` : "/api/videos", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setModalOpen(false);
      setRefreshToken((value) => value + 1);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const shouldDelete = window.confirm(`Da li želite da izbrišete video "${title}"?`);

    if (!shouldDelete) {
      return;
    }

    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    setRefreshToken((value) => value + 1);
  };

  return (
    <section className="cms-admin-page">
      <div className="cms-admin-intro">
        <em className="text-white">CMS</em>
        <h1 className="text-white mt-2 mb-3">Upravljanje videima</h1>
      </div>

      <div className="cms-admin-card">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(0);
            setAppliedFilters(draftFilters);
          }}
        >
          <div className="cms-admin-toolbar">
            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="videos-title-filter">
                Naslov
              </label>
              <input
                id="videos-title-filter"
                className="cms-admin-input"
                value={draftFilters.title}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="videos-category-filter">
                Kategorija
              </label>
              <select
                id="videos-category-filter"
                className="cms-admin-select"
                value={draftFilters.categorySlug}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, categorySlug: event.target.value }))
                }
              >
                {VIDEO_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="videos-source-filter">
                Izvor
              </label>
              <select
                id="videos-source-filter"
                className="cms-admin-select"
                value={draftFilters.isYouTube}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    isYouTube: event.target.value as VideoSourceFilter,
                  }))
                }
              >
                <option value="all">Sve</option>
                <option value="true">YouTube</option>
                <option value="false">Ostalo</option>
              </select>
            </div>
          </div>

          <div className="cms-admin-actions">
            <button
              type="button"
              className="btn custom-btn custom-border-btn"
              onClick={() => {
                const resetFilters = { title: "", categorySlug: "", isYouTube: "all" as VideoSourceFilter };
                setDraftFilters(resetFilters);
                setAppliedFilters(resetFilters);
                setPage(0);
              }}
            >
              Očisti
            </button>
            <button type="submit" className="btn custom-btn custom-border-btn">
              Pretraži
            </button>
          </div>
        </form>
      </div>

      <div className="cms-admin-card">
        <div className="cms-admin-table-header">
          <h2 className="text-white mb-0">Video</h2>
          <button type="button" className="btn custom-btn custom-border-btn" onClick={openCreateModal}>
            Novi video
          </button>
        </div>

        <div className="cms-admin-table-wrap">
          <table className="cms-admin-table">
            <thead>
              <tr>
                <th>Naslov</th>
                <th>Kategorija</th>
                <th>YouTube</th>
                <th>URL</th>
                <th>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.categorySlug}</td>
                  <td>{item.isYouTube ? "Da" : "Ne"}</td>
                  <td>{item.url}</td>
                  <td>
                    <div className="cms-admin-row-actions">
                      <button
                        type="button"
                        className="btn custom-btn custom-border-btn"
                        onClick={() => openEditModal(item.id)}
                      >
                        Izmeni
                      </button>
                      <button
                        type="button"
                        className="btn custom-btn custom-border-btn"
                        onClick={() => handleDelete(item.id, item.title)}
                      >
                        Obriši
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!items.length && !loading ? (
                <tr>
                  <td colSpan={5} className="cms-admin-empty">
                    Nema rezultata za izabrane filtere.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <CmsPagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPage(0);
          }}
        />
      </div>

      <CmsModal
        open={modalOpen}
        title={editingId ? "Izmena videa" : "Novi video"}
        onClose={() => setModalOpen(false)}
      >
        <form className="cms-admin-form" onSubmit={handleSave}>
          <div className="cms-admin-grid">
            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="video-title">
                Naslov
              </label>
              <input
                id="video-title"
                className="cms-admin-input"
                value={formState.title}
                onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="video-category">
                Kategorija
              </label>
              <select
                id="video-category"
                className="cms-admin-select"
                value={formState.categorySlug}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, categorySlug: event.target.value }))
                }
                required
              >
                {VIDEO_CATEGORY_OPTIONS.filter((option) => option.value).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cms-admin-grid">
            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="video-url">
                URL
              </label>
              <input
                id="video-url"
                className="cms-admin-input"
                value={formState.url}
                onChange={(event) => setFormState((current) => ({ ...current, url: event.target.value }))}
                required
              />
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="video-image-url">
                URL slike
              </label>
              <input
                id="video-image-url"
                className="cms-admin-input"
                value={formState.imageUrl || ""}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, imageUrl: event.target.value }))
                }
              />
            </div>
          </div>

          <label className="cms-admin-checkbox">
            <input
              type="checkbox"
              checked={Boolean(formState.isYouTube)}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  isYouTube: event.target.checked,
                }))
              }
            />
            <span>YouTube video</span>
          </label>

          <div className="cms-admin-actions">
            <button type="button" className="btn custom-btn custom-border-btn" onClick={() => setModalOpen(false)}>
              Odustani
            </button>
            <button type="submit" className="btn custom-btn custom-border-btn" disabled={saveLoading}>
              {saveLoading ? "Čuvanje..." : "Sačuvaj"}
            </button>
          </div>
        </form>
      </CmsModal>
    </section>
  );
}

export const getServerSideProps = requireCmsPageAuth;
