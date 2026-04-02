import { FormEvent, useEffect, useState } from "react";
import CmsModal from "../../../components/CmsModal";
import CmsPagination from "../../../components/CmsPagination";
import { Book, BookInput } from "../../../lib/types";

type BookCategoryFilter = "all" | "pdf" | "free-books";

const EMPTY_FORM: BookInput = {
  title: "",
  author: "",
  description: "",
  imageUrl: "",
  pdfUrl: "",
};

interface BooksResponse {
  results: Book[];
  totalItems: number;
}

export default function CmsBooksPage() {
  const [items, setItems] = useState<Book[]>([]);
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
    author: "",
    category: "all" as BookCategoryFilter,
  });
  const [appliedFilters, setAppliedFilters] = useState(draftFilters);
  const [formState, setFormState] = useState<BookInput>(EMPTY_FORM);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          take: String(pageSize),
          title: appliedFilters.title,
          author: appliedFilters.author,
        });

        if (appliedFilters.category !== "all") {
          params.set("category", appliedFilters.category);
        }

        const response = await fetch(`/api/books?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load books.");
        }

        const data = (await response.json()) as BooksResponse;

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
    const response = await fetch(`/api/books/${id}`);
    const data = (await response.json()) as Book;

    setEditingId(id);
    setFormState({
      title: data.title,
      author: data.author,
      description: data.description || "",
      imageUrl: data.imageUrl,
      pdfUrl: data.pdfUrl || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveLoading(true);

    try {
      const response = await fetch(editingId ? `/api/books/${editingId}` : "/api/books", {
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
    const shouldDelete = window.confirm(`Da li želite da izbrišete knjigu "${title}"?`);

    if (!shouldDelete) {
      return;
    }

    await fetch(`/api/books/${id}`, { method: "DELETE" });
    setRefreshToken((value) => value + 1);
  };

  return (
    <section className="cms-admin-page">
      <div className="cms-admin-intro">
        <em className="text-white">CMS</em>
        <h1 className="text-white mt-2 mb-3">Upravljanje knjigama</h1>
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
              <label className="cms-admin-label" htmlFor="books-title-filter">
                Naslov
              </label>
              <input
                id="books-title-filter"
                className="cms-admin-input"
                value={draftFilters.title}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="books-author-filter">
                Autor
              </label>
              <input
                id="books-author-filter"
                className="cms-admin-input"
                value={draftFilters.author}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, author: event.target.value }))
                }
              />
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="books-category-filter">
                Kategorija
              </label>
              <select
                id="books-category-filter"
                className="cms-admin-select"
                value={draftFilters.category}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    category: event.target.value as BookCategoryFilter,
                  }))
                }
              >
                <option value="all">Sve</option>
                <option value="pdf">PDF</option>
                <option value="free-books">Besplatna knjiga</option>
              </select>
            </div>
          </div>

          <div className="cms-admin-actions">
            <button
              type="button"
              className="btn custom-btn custom-border-btn"
              onClick={() => {
                const resetFilters = { title: "", author: "", category: "all" as BookCategoryFilter };
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
          <h2 className="text-white mb-0">Knjige</h2>
          <button type="button" className="btn custom-btn custom-border-btn" onClick={openCreateModal}>
            Nova knjiga
          </button>
        </div>

        <div className="cms-admin-table-wrap">
          <table className="cms-admin-table">
            <thead>
              <tr>
                <th>Naslov</th>
                <th>Autor</th>
                <th>Opis</th>
                <th>PDF</th>
                <th>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.author}</td>
                  <td>{item.description || "Bez opisa"}</td>
                  <td>{item.pdfUrl ? "Da" : "Ne"}</td>
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
        title={editingId ? "Izmena knjige" : "Nova knjiga"}
        onClose={() => setModalOpen(false)}
      >
        <form className="cms-admin-form" onSubmit={handleSave}>
          <div className="cms-admin-grid">
            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="book-title">
                Naslov
              </label>
              <input
                id="book-title"
                className="cms-admin-input"
                value={formState.title}
                onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="book-author">
                Autor
              </label>
              <input
                id="book-author"
                className="cms-admin-input"
                value={formState.author}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, author: event.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="cms-admin-field">
            <label className="cms-admin-label" htmlFor="book-description">
              Opis
            </label>
            <textarea
              id="book-description"
              className="cms-admin-textarea"
              value={formState.description || ""}
              onChange={(event) =>
                setFormState((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>

          <div className="cms-admin-grid">
            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="book-image-url">
                URL slike
              </label>
              <input
                id="book-image-url"
                className="cms-admin-input"
                value={formState.imageUrl || ""}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, imageUrl: event.target.value }))
                }
              />
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="book-pdf-url">
                PDF URL
              </label>
              <input
                id="book-pdf-url"
                className="cms-admin-input"
                value={formState.pdfUrl || ""}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, pdfUrl: event.target.value }))
                }
              />
            </div>
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
