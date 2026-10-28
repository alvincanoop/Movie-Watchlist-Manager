import React from 'react';
import { Clock, Tv, Star, Edit3, Trash2, ArrowRightCircle } from 'lucide-react';

const GENRE_COLORS = {
  Action: 'badge-red',
  Comedy: 'badge-yellow',
  Drama: 'badge-purple',
  Horror: 'badge-darkred',
  'Sci-Fi': 'badge-cyan',
  Romance: 'badge-pink',
  Thriller: 'badge-orange'
};

const STATUS_CONFIG = {
  'To Watch': {
    label: 'To Watch',
    badgeClass: 'status-to-watch',
    dotClass: 'dot-to-watch'
  },
  Watching: {
    label: 'Watching',
    badgeClass: 'status-watching',
    dotClass: 'dot-watching'
  },
  Watched: {
    label: 'Watched',
    badgeClass: 'status-watched',
    dotClass: 'dot-watched'
  }
};

export default function MovieCard({ movie, onEdit, onChangeStatus, onDelete }) {
  const isWatching = movie.status === 'Watching';
  const isWatched = movie.status === 'Watched';
  const statusInfo = STATUS_CONFIG[movie.status] || STATUS_CONFIG['To Watch'];
  const genreBadgeClass = GENRE_COLORS[movie.genre] || 'badge-default';

  return (
    <div className={`movie-card ${isWatched ? 'card-watched' : ''}`}>
      {/* Top Header: Movie Code & Status Badge */}
      <div className="movie-card-header">
        <span className="movie-code">{movie.movieCode}</span>
        <span className={`status-pill ${statusInfo.badgeClass}`}>
          <span className={`status-dot ${statusInfo.dotClass}`}></span>
          {statusInfo.label}
        </span>
      </div>

      {/* Title & Release Year */}
      <div className="movie-card-title-section">
        <h3 className="movie-title" title={movie.title}>
          {movie.title}
        </h3>
        <span className="movie-year">({movie.releaseYear})</span>
      </div>

      {/* Meta tags: Genre, Platform, Runtime */}
      <div className="movie-tags">
        <span className={`tag-badge ${genreBadgeClass}`}>{movie.genre}</span>
        <span className="tag-badge badge-neutral">
          <Tv size={12} className="tag-icon" />
          {movie.platform}
        </span>
        <span className="tag-badge badge-neutral">
          <Clock size={12} className="tag-icon" />
          {movie.runtime} min
        </span>
      </div>

      {/* Priority and Rating display */}
      <div className="movie-metrics">
        <div className="priority-indicator">
          <span className="metric-label">Priority:</span>
          <div className="stars-row">
            {[1, 2, 3, 4, 5].map((starVal) => (
              <Star
                key={starVal}
                size={14}
                className={starVal <= movie.priority ? 'star-filled' : 'star-empty'}
              />
            ))}
            <span className="priority-num">({movie.priority}/5)</span>
          </div>
        </div>

        {isWatched && (
          <div className="rating-indicator">
            <span className="metric-label">Rating:</span>
            <span className="rating-badge">
              ⭐ <strong>{movie.rating}</strong>/10
            </span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="movie-card-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(movie)}
          title="Edit movie details"
        >
          <Edit3 size={14} />
          <span>Edit</span>
        </button>

        <button
          type="button"
          className={`btn btn-accent btn-sm ${isWatched ? 'btn-disabled' : ''}`}
          onClick={() => onChangeStatus(movie)}
          disabled={isWatched}
          title={isWatched ? 'Watched status is final' : 'Update movie status'}
        >
          <ArrowRightCircle size={14} />
          <span>{isWatched ? 'Completed' : 'Status'}</span>
        </button>

        <button
          type="button"
          className={`btn btn-danger btn-sm ${isWatching ? 'btn-disabled' : ''}`}
          onClick={() => onDelete(movie)}
          disabled={isWatching}
          title={isWatching ? 'Cannot delete movie while in Watching status' : 'Delete movie'}
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>

      {/* Disabled delete tooltip hint */}
      {isWatching && (
        <div className="card-footnote">
          * Delete is locked while movie is in Watching status
        </div>
      )}
    </div>
  );
}
