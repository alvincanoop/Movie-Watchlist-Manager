import React from 'react';
import { X, Sparkles, Clock, Tv, Star, Film, PlayCircle } from 'lucide-react';

export default function WatchNextModal({
  isOpen,
  onClose,
  movie,
  isLoading,
  errorMessage,
  onStartWatching
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-compact" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Sparkles className="text-magic" size={20} />
            <h2 className="modal-title">What Should I Watch Next?</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="watch-next-body">
          {isLoading ? (
            <div className="watch-next-loading">
              <div className="spinner"></div>
              <p className="state-desc" style={{ marginTop: '12px' }}>
                Finding your highest-priority recommendation...
              </p>
            </div>
          ) : errorMessage ? (
            <div className="watch-next-empty">
              <Film size={44} className="text-muted" style={{ margin: '0 auto 12px' }} />
              <h3 className="state-title">No Movies in "To Watch"</h3>
              <p className="state-desc">{errorMessage}</p>
            </div>
          ) : movie ? (
            <div className="recommendation-card">
              <div className="recommendation-badge">
                <Sparkles size={14} /> Top Pick for You
              </div>

              <div className="recommendation-header">
                <span className="movie-code">{movie.movieCode}</span>
                <span className="rec-priority">
                  <Star size={14} className="star-filled" /> Priority {movie.priority}/5
                </span>
              </div>

              <h3 className="rec-title">{movie.title}</h3>
              <div className="rec-year">Released in {movie.releaseYear}</div>

              <div className="movie-tags" style={{ justifyContent: 'center', marginTop: '10px' }}>
                <span className="tag-badge badge-neutral">{movie.genre}</span>
                <span className="tag-badge badge-neutral">
                  <Tv size={12} className="tag-icon" /> {movie.platform}
                </span>
                <span className="tag-badge badge-neutral">
                  <Clock size={12} className="tag-icon" /> {movie.runtime} min
                </span>
              </div>

              <div className="rec-reasoning">
                Selected based on your highest priority rating (Level {movie.priority})
                and shortest runtime ({movie.runtime} min) among available un-watched titles.
              </div>

              {onStartWatching && (
                <button
                  type="button"
                  className="btn btn-magic"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => onStartWatching(movie._id)}
                >
                  <PlayCircle size={16} />
                  <span>Start Watching Now</span>
                </button>
              )}
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
