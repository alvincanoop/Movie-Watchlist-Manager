import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsDashboard from './components/StatsDashboard';
import FilterBar from './components/FilterBar';
import MovieCard from './components/MovieCard';
import Pagination from './components/Pagination';
import MovieFormModal from './components/MovieFormModal';
import StatusModal from './components/StatusModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import WatchNextModal from './components/WatchNextModal';
import { movieApi } from './services/api';
import { Film, AlertCircle, RefreshCw, PlusCircle } from 'lucide-react';

export default function App() {
  // Movie listing & pagination states
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMovies: 0,
    limit: 6
  });
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genreFilter, setGenreFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Statistics Dashboard state
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Global error notification
  const [globalError, setGlobalError] = useState('');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedMovieForEdit, setSelectedMovieForEdit] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedMovieForStatus, setSelectedMovieForStatus] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMovieForDelete, setSelectedMovieForDelete] = useState(null);

  // "Watch Next" Recommendation state
  const [isWatchNextModalOpen, setIsWatchNextModalOpen] = useState(false);
  const [recommendedMovie, setRecommendedMovie] = useState(null);
  const [isLoadingWatchNext, setIsLoadingWatchNext] = useState(false);
  const [watchNextError, setWatchNextError] = useState('');

  // Fetch Dashboard Statistics
  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const response = await movieApi.getStats();
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.warn('Could not fetch stats:', err.message);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch Movies with filters and pagination
  const loadMovies = useCallback(async () => {
    setIsLoadingMovies(true);
    setGlobalError('');
    try {
      const response = await movieApi.getMovies({
        status: statusFilter,
        genre: genreFilter,
        search,
        page: currentPage,
        limit: 6
      });

      if (response && response.data) {
        setMovies(response.data.movies || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
      setGlobalError(err.message || 'Unable to fetch watchlist. Ensure backend is running.');
      setMovies([]);
    } finally {
      setIsLoadingMovies(false);
    }
  }, [statusFilter, genreFilter, search, currentPage]);

  // Initial load
  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Filter change handlers (reset page to 1)
  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleGenreFilterChange = (val) => {
    setGenreFilter(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setGenreFilter('All');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Helper to refresh both movies and stats after any mutation
  const refreshAll = async () => {
    await Promise.all([loadMovies(), loadStats()]);
  };

  // Modal open handlers
  const handleOpenAdd = () => {
    setSelectedMovieForEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setSelectedMovieForEdit(movie);
    setIsAddEditModalOpen(true);
  };

  const handleOpenStatus = (movie) => {
    setSelectedMovieForStatus(movie);
    setIsStatusModalOpen(true);
  };

  const handleOpenDelete = (movie) => {
    setSelectedMovieForDelete(movie);
    setIsDeleteModalOpen(true);
  };

  // Handler: "What Should I Watch Next?"
  const handleOpenWatchNext = async () => {
    setIsWatchNextModalOpen(true);
    setIsLoadingWatchNext(true);
    setRecommendedMovie(null);
    setWatchNextError('');

    try {
      const response = await movieApi.getWatchNext();
      if (response && response.data) {
        setRecommendedMovie(response.data);
      }
    } catch (err) {
      setWatchNextError(
        err.message || 'No movies in "To Watch" status. Add movies to your watchlist first!'
      );
    } finally {
      setIsLoadingWatchNext(false);
    }
  };

  // Start watching directly from Watch Next modal
  const handleStartWatchingFromRecommendation = async (movieId) => {
    try {
      await movieApi.updateStatus(movieId, 'Watching', null);
      setIsWatchNextModalOpen(false);
      await refreshAll();
    } catch (err) {
      alert(err.message || 'Failed to update status to Watching');
    }
  };

  // Save Add / Edit
  const handleSaveMovie = async (formData) => {
    if (selectedMovieForEdit) {
      await movieApi.updateMovie(selectedMovieForEdit._id, {
        title: formData.title,
        genre: formData.genre,
        runtime: formData.runtime,
        platform: formData.platform,
        priority: formData.priority
      });
    } else {
      await movieApi.addMovie(formData);
    }
    await refreshAll();
  };

  // Status transition handler
  const handleStatusTransition = async (movieId, newStatus, rating) => {
    await movieApi.updateStatus(movieId, newStatus, rating);
    await refreshAll();
  };

  // Rating update handler
  const handleRatingUpdate = async (movieId, newRating) => {
    await movieApi.updateRating(movieId, newRating);
    await refreshAll();
  };

  // Delete handler
  const handleDeleteMovie = async (movieId) => {
    await movieApi.deleteMovie(movieId);
    await refreshAll();
  };

  return (
    <div className="app-wrapper">
      {/* Top Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAdd}
        onOpenWatchNextModal={handleOpenWatchNext}
      />

      <main className="main-content">
        {/* Statistics Dashboard (Auto-refreshes on any operation) */}
        <StatsDashboard stats={stats} isLoading={isLoadingStats} />

        {/* Search & Filter Bar */}
        <FilterBar
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusFilterChange}
          genreFilter={genreFilter}
          onGenreChange={handleGenreFilterChange}
          onResetFilters={handleResetFilters}
          totalResults={pagination.totalMovies}
        />

        {/* Error notification banner */}
        {globalError && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{globalError}</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={refreshAll}
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoadingMovies ? (
          <div className="state-container">
            <div className="spinner"></div>
            <p className="state-title">Loading watchlist...</p>
            <p className="state-desc">Fetching movies matching your filter criteria</p>
          </div>
        ) : movies.length === 0 ? (
          /* Empty State */
          <div className="state-container">
            <Film size={44} className="text-muted" style={{ margin: '0 auto 10px' }} />
            <h3 className="state-title">No Movies Found</h3>
            <p className="state-desc">
              {search || statusFilter !== 'All' || genreFilter !== 'All'
                ? 'No movies match your current search and filter criteria. Try clearing filters.'
                : 'Your watchlist is empty. Add your favorite movies to begin!'}
            </p>
            {search || statusFilter !== 'All' || genreFilter !== 'All' ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetFilters}
              >
                Clear All Filters
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
                <PlusCircle size={16} /> Add Your First Movie
              </button>
            )}
          </div>
        ) : (
          /* Movie Cards Grid */
          <>
            <div className="movies-grid">
              {movies.map((movie) => (
                <MovieCard
                  key={movie._id || movie.movieCode}
                  movie={movie}
                  onEdit={handleOpenEdit}
                  onChangeStatus={handleOpenStatus}
                  onDelete={handleOpenDelete}
                />
              ))}
            </div>

            {/* Pagination Controls (6 per page) */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalMovies={pagination.totalMovies}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      {/* Add / Edit Movie Modal */}
      <MovieFormModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleSaveMovie}
        initialMovie={selectedMovieForEdit}
      />

      {/* Status Transition & Rating Modal */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        movie={selectedMovieForStatus}
        onStatusUpdate={handleStatusTransition}
        onRatingUpdate={handleRatingUpdate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        movie={selectedMovieForDelete}
        onConfirm={handleDeleteMovie}
      />

      {/* Watch Next Recommendation Modal */}
      <WatchNextModal
        isOpen={isWatchNextModalOpen}
        onClose={() => setIsWatchNextModalOpen(false)}
        movie={recommendedMovie}
        isLoading={isLoadingWatchNext}
        errorMessage={watchNextError}
        onStartWatching={handleStartWatchingFromRecommendation}
      />
    </div>
  );
}
