interface CmsPaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function CmsPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: CmsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="cms-pagination">
      <div className="cms-pagination-info">
        Strana {Math.min(page + 1, totalPages)} od {totalPages} · Ukupno {totalItems}
      </div>

      <div className="cms-pagination-actions">
        <select
          className="cms-admin-select cms-pagination-select"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} po strani
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn custom-btn custom-border-btn"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          Prethodna
        </button>

        <button
          type="button"
          className="btn custom-btn custom-border-btn"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sledeća
        </button>
      </div>
    </div>
  );
}
