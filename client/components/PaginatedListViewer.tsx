import { useState } from "react";

interface PaginatedListProps<T> {
  items: T[];
  perPage?: number;
  renderItem: (item: T) => React.ReactNode;
}

export function PaginatedListViewer<T>({ items, perPage = 5, renderItem }: PaginatedListProps<T>) {
  const [page, setPage] = useState(1);

  const start = (page - 1) * perPage;
  const paginated = items.slice(start, start + perPage);
  const totalPages = Math.ceil(items.length / perPage);

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-2 w-full">
        {paginated.map((item, i) => (
          <div key={i}>{renderItem(item)}</div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ←
          </button>

          <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 border rounded disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
