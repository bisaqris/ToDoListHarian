import { Search, X } from "lucide-react";
import { categories, priorities } from "../utils/constants";

export const FilterBar = ({ filters, onFilterChange }) => {
  const hasActiveFilters = filters.search || filters.category !== "all" || filters.priority !== "all" || filters.status !== "all";

  const clearFilters = () => {
    onFilterChange({
      search: "",
      category: "all",
      priority: "all",
      status: "all",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Filter & Cari</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition-all"
          >
            <X size={14} />
            Hapus Filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari judul atau deskripsi..."
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <select
          value={filters.category}
          onChange={(e) =>
            onFilterChange({ ...filters, category: e.target.value })
          }
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) =>
            onFilterChange({ ...filters, priority: e.target.value })
          }
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="all">Semua Prioritas</option>
          {priorities.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange({ ...filters, status: e.target.value })
          }
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
};
