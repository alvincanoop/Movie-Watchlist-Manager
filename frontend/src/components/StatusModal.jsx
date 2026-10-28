import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function StatusModal({ isOpen, onClose, movie, onStatusUpdate, onRatingUpdate }) {
  if (!isOpen || !movie) return null;

  const currentStatus = movie.status;
  const isAlreadyWatched = currentStatus === 'Watched';

  // Compute ONLY valid next statuses according to the workflow:
  // - 'To Watch' -> ['Watching', 'Watched']
  // - 'Watching' -> ['Watched', 'To Watch']
  // - 'Watched'  -> [] (Final, cannot transition)
  const getValidNextStatuses = () => {
    if (currentStatus === 'To Watch') return ['Watching', 'Watched'];
    if (currentStatus === 'Watching') return ['Watched', 'To Watch'];
    return [];
  };

  const validNextStatuses = getValidNextStatuses();

  const [selectedStatus, setSelectedStatus] = useState(
    validNextStatuses.length > 0 ? validNextStatuses[0] : currentStatus
  );
  const [rating, setRating] = useState(movie.rating || 8);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nextList = getValidNextStatuses();
    setSelectedStatus(nextList.length > 0 ? nextList[0] : currentStatus);
    setRating(movie.rating || 8);
    setErrorMessage('');
  }, [movie]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // If movie is already watched, user is just updating the rating
    if (isAlreadyWatched) {
      if (!rating || rating < 1 || rating > 10) {
        setErrorMessage('Rating must be a valid number between 1 and 10.');
        return;
      }
      setIsSubmitting(true);
      try {
        await onRatingUpdate(movie._id, Number(rating));
        onClose();
      } catch (err) {
        setErrorMessage(err.message || 'Failed to update rating.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Moving to 'Watched' requires mandatory rating (1 to 10)
    if (selectedStatus === 'Watched') {
      if (!rating || rating < 1 || rating > 10) {
        setErrorMessage('Rating from 1 to 10 is mandatory when marking a movie as Watched.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onStatusUpdate(
        movie._id,
        selectedStatus,
        selectedStatus === 'Watched' ? Number(rating) : null
      );
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update movie status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-compact" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <RefreshCw className="modal-icon" size={20} />
            <h2 className="modal-title">
              {isAlreadyWatched ? 'Edit Movie Rating' : 'Update Watch Status'}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="alert-error">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="status-movie-summary">
            <span className="movie-code">{movie.movieCode}</span>
            <strong className="summary-title">{movie.title}</strong>
            <span className="summary-current">Current: <span className="badge-pill">{currentStatus}</span></span>
          </div>

          {isAlreadyWatched ? (
            <div className="workflow-immutable-notice">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>Watched status is final. You may update your rating below:</span>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="targetStatus">Select Next Status *</label>
              <select
                id="targetStatus"
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setErrorMessage('');
                }}
              >
                {validNextStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <p className="field-hint">
                * Only valid workflow transitions are displayed.
              </p>
            </div>
          )}

          {/* Rating input (Mandatory if selecting Watched or editing Watched rating) */}
          {(selectedStatus === 'Watched' || isAlreadyWatched) && (
            <div className="form-group rating-selection-box">
              <div className="rating-header">
                <label htmlFor="rating">
                  Movie Rating (1 to 10) *
                </label>
                <span className="rating-pill">
                  <Star size={14} className="star-filled" /> {rating}/10
                </span>
              </div>
              <input
                id="rating"
                type="range"
                min="1"
                max="10"
                step="1"
                className="form-range"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
              <div className="range-ticks">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : isAlreadyWatched ? 'Save Rating' : 'Confirm Transition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

