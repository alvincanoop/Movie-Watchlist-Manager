import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import MovieFormModal from './components/MovieFormModal';
import StatusModal from './components/StatusModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { movieApi } from './services/api';
import { Film, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');

  // Modal visibility states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedMovieForEdit, setSelectedMovieForEdit] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedMovieForStatus, setSelectedMovieForStatus] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMovieForDelete, setSelectedMovieForDelete] = useState(null);

  // Fetch movies from backend
  const loadMovies = useCallback(async () => {
    setIsLoading(true);
    setGlobalError('');
    try {
      const response = await movieApi.getMovies();
      if (response && response.data && response.data.movies) {
        setMovies(response.data.movies);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
      setGlobalError(err.message || 'Unable to fetch watchlist. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  // Open modal handlers
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

  // Submit Add or Edit
  const handleSaveMovie = async (formData) => {
    if (selectedMovieForEdit) {
      // Edit: Code and Release Year are not sent/updated
      await movieApi.updateMovie(selectedMovieForEdit._id, {
        title: formData.title,
        genre: formData.genre,
        runtime: formData.runtime,
        platform: formData.platform,
        priority: formData.priority
      });
    } else {
      // Add: backend generates code, starts in 'To Watch'
      await movieApi.addMovie(formData);
    }
    await loadMovies();
  };

  // Status transition handler
  const handleStatusTransition = async (movieId, newStatus, rating) => {
    await movieApi.updateStatus(movieId, newStatus, rating);
    await loadMovies();
  };

  // Rating update handler (for watched movies)
  const handleRatingUpdate = async (movieId, newRating) => {
    await movieApi.updateRating(movieId, newRating);
    await loadMovies();
  };

  // Delete movie handler
  const handleDeleteMovie = async (movieId) => {
    await movieApi.deleteMovie(movieId);
    await loadMovies();
  };

  return (
    <div className="app-wrapper">
      {/* Top Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAdd}
        onOpenWatchNextModal={() => {
          // Placeholder for Stage 5 "Watch Next" modal trigger
          alert('Watch Next modal will be integrated in Stage 5');
        }}
      />

      <main className="main-content">
        {/* Error notification banner */}
        {globalError && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{globalError}</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={loadMovies}
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="state-container">
            <div className="spinner"></div>
            <p className="state-title">Loading watchlist...</p>
            <p className="state-desc">Fetching movies from your database</p>
          </div>
        ) : movies.length === 0 ? (
          /* Empty State */
          <div className="state-container">
            <Film size={48} className="text-muted" style={{ margin: '0 auto' }} />
            <h3 className="state-title">Your Watchlist is Empty</h3>
            <p className="state-desc">
              Start adding movies you want to watch, track your progress, and rate finished films!
            </p>
            <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
              Add Your First Movie
            </button>
          </div>
        ) : (
          /* Movies Grid */
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
    </div>
  );
}
