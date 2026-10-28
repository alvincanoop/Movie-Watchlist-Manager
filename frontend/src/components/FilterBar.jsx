import React from 'react';
import { Search, Filter, XCircle } from 'lucide-react';

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const STATUSES = ['All', 'To Watch', 'Watching', 'Watched'];

export default function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  genreFilter,
  onGenreChange,
  onResetFilters,
  totalResults
}) {
  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'All' || genreFilter !== 'All';

  return (
    <div className="filter-bar-container">
      {/* Search Input */}
      <div className="search-input-wrap">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search movies by title..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <XCircle size={14} />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="filters-row">
        {/* Status Filter */}
        <div className="filter-item">
          <label htmlFor="status-filter" className="filter-label">
            Status:
          </label>
          <select
            id="status-filter"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? 'All Statuses' : st}
              </option>
            ))}
          </select>
        </div>

        {/* Genre Filter */}
        <div className="filter-item">
          <label htmlFor="genre-filter" className="filter-label">
            Genre:
          </label>
          <select
            id="genre-filter"
            className="filter-select"
            value={genreFilter}
            onChange={(e) => onGenreChange(e.target.value)}
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g === 'All' ? 'All Genres' : g}
              </option>
            ))}
          </select>
        </div>

        {/* Reset button if active */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-sm reset-filter-btn"
            onClick={onResetFilters}
            title="Clear all filters"
          >
            <Filter size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
