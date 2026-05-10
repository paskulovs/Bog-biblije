import { FormEvent, useEffect, useState } from "react";
import CmsModal from "../../../components/CmsModal";
import CmsPagination from "../../../components/CmsPagination";
import RichContentEditor from "../../../components/RichContentEditor";
import { requireCmsPageAuth } from "../../../lib/auth";
import { BlogPostInput, ReadableArticle } from "../../../lib/types";

type ChildCornerFilter = "all" | "true" | "false";

const EMPTY_FORM: BlogPostInput = {
  title: "",
  excerpt: "",
  content: "",
  author: "",
  imageUrl: "",
  audioUrl: "",
  isChildCorner: false,
};

const getTextContent = (html: string) => {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
  }

  const container = window.document.createElement("div");
  container.innerHTML = html;
  return (container.textContent || "").replace(/\u00a0/g, " ").trim();
};

interface ArticlesResponse {
  results: ReadableArticle[];
  totalItems: number;
}

export default function CmsArticlesPage() {
  const [items, setItems] = useState<ReadableArticle[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftFilters, setDraftFilters] = useState({
    title: "",
    excerpt: "",
    isChildCorner: "all" as ChildCornerFilter,
  });
  const [appliedFilters, setAppliedFilters] = useState(draftFilters);
  const [formState, setFormState] = useState<BlogPostInput>(EMPTY_FORM);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          take: String(pageSize),
          title: appliedFilters.title,
          excerpt: appliedFilters.excerpt,
        });

        if (appliedFilters.isChildCorner !== "all") {
          params.set("isChildCorner", appliedFilters.isChildCorner);
        }

        const response = await fetch(`/api/blog-posts?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load blog posts.");
        }

        const data = (await response.json()) as ArticlesResponse;

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
    const response = await fetch(`/api/blog-posts/${id}`);
    const data = (await response.json()) as ReadableArticle;

    setEditingId(id);
    setFormState({
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      author: data.author,
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl || "",
      isChildCorner: Boolean(data.isChildCorner),
    });
    setModalOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!getTextContent(formState.content)) {
      window.alert("Unesite sadržaj članka.");
      return;
    }

    setSaveLoading(true);

    try {
      const response = await fetch(editingId ? `/api/blog-posts/${editingId}` : "/api/blog-posts", {
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
    const shouldDelete = window.confirm(`Da li želite da izbrišete članak "${title}"?`);

    if (!shouldDelete) {
      return;
    }

    await fetch(`/api/blog-posts/${id}`, { method: "DELETE" });
    setRefreshToken((value) => value + 1);
  };

  return (
    <section className="cms-admin-page">
      <div className="cms-admin-intro">
        <h1 className="text-white mb-3">Upravljanje člancima</h1>
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
              <label className="cms-admin-label" htmlFor="article-title-filter">
                Naslov
              </label>
              <input
                id="article-title-filter"
                className="cms-admin-input"
                value={draftFilters.title}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="article-excerpt-filter">
                Kratki sadržaj
              </label>
              <input
                id="article-excerpt-filter"
                className="cms-admin-input"
                value={draftFilters.excerpt}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, excerpt: event.target.value }))
                }
              />
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="article-child-filter">
                Kategorija
              </label>
              <select
                id="article-child-filter"
                className="cms-admin-select"
                value={draftFilters.isChildCorner}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    isChildCorner: event.target.value as ChildCornerFilter,
                  }))
                }
              >
                <option value="all">Sve</option>
                <option value="true">Dečiji kutak</option>
                <option value="false">Ostalo</option>
              </select>
            </div>
          </div>

          <div className="cms-admin-actions">
            <button
              type="button"
              className="btn custom-btn custom-border-btn"
              onClick={() => {
                setDraftFilters({ title: "", excerpt: "", isChildCorner: "all" });
                setAppliedFilters({ title: "", excerpt: "", isChildCorner: "all" });
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
          <h2 className="text-white mb-0">Članci</h2>
          <button type="button" className="btn custom-btn custom-border-btn" onClick={openCreateModal}>
            Novi članak
          </button>
        </div>

        <div className="cms-admin-table-wrap">
          <table className="cms-admin-table">
            <thead>
              <tr>
                <th>Naslov</th>
                <th>Autor</th>
                <th>Kratki sadržaj</th>
                <th>Dečiji kutak</th>
                <th>Pregledi</th>
                <th>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.author}</td>
                  <td>{item.excerpt}</td>
                  <td>{item.isChildCorner ? "Da" : "Ne"}</td>
                  <td>{item.readCount}</td>
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
                  <td colSpan={6} className="cms-admin-empty">
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
        title={editingId ? "Izmena članka" : "Novi članak"}
        onClose={() => setModalOpen(false)}
        closeOnBackdropClick={false}
      >
        <form className="cms-admin-form" onSubmit={handleSave}>
          <div className="cms-admin-field">
            <label className="cms-admin-label" htmlFor="article-title">
              Naslov
            </label>
            <input
              id="article-title"
              className="cms-admin-input"
              value={formState.title}
              onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </div>

          <div className="cms-admin-field">
            <label className="cms-admin-label" htmlFor="article-excerpt">
              Kratki sadržaj
            </label>
            <textarea
              id="article-excerpt"
              className="cms-admin-textarea"
              value={formState.excerpt}
              onChange={(event) =>
                setFormState((current) => ({ ...current, excerpt: event.target.value }))
              }
              required
            />
          </div>

          <div className="cms-admin-grid">
            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="article-author">
                Autor
              </label>
              <input
                id="article-author"
                className="cms-admin-input"
                value={formState.author}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, author: event.target.value }))
                }
                required
              />
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="article-image-url">
                URL slike
              </label>
              <input
                id="article-image-url"
                className="cms-admin-input"
                value={formState.imageUrl || ""}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, imageUrl: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="cms-admin-grid">
            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="article-audio-url">
                Audio URL
              </label>
              <input
                id="article-audio-url"
                className="cms-admin-input"
                value={formState.audioUrl || ""}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, audioUrl: event.target.value }))
                }
              />
            </div>

            <label className="cms-admin-checkbox">
              <input
                type="checkbox"
                checked={Boolean(formState.isChildCorner)}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    isChildCorner: event.target.checked,
                  }))
                }
              />
              <span>Dečiji kutak</span>
            </label>
          </div>

          <div className="cms-admin-field">
            <label className="cms-admin-label" htmlFor="article-content">
              Sadržaj
            </label>
            <RichContentEditor
              id="article-content"
              value={formState.content}
              onChange={(content) => setFormState((current) => ({ ...current, content }))}
            />
          </div>

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
