import React from 'react';
import { Film, Clock, Star, Award, Eye, PlayCircle, CheckCircle } from 'lucide-react';

export default function StatsDashboard({ stats, isLoading }) {
  if (!stats) return null;

  const { statusCounts, totalMovies, totalHoursWatched, averageRating, topWatchedGenre, topWatchedGenreCount } = stats;

  return (
    <section className="stats-section">
      <div className="stats-header">
        <h2 className="stats-section-title">Watchlist Overview</h2>
        <span className="stats-live-indicator">
          <span className="live-dot"></span> Live Stats
        </span>
      </div>

      <div className="stats-grid">
        {/* Card 1: Status Distribution */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Watchlist Pipeline</span>
            <div className="stat-icon-wrap icon-indigo">
              <Film size={18} />
            </div>
          </div>
          <div className="stat-main-val">
            <span className="stat-number">{totalMovies || 0}</span>
            <span className="stat-unit">Total Movies</span>
          </div>
          <div className="status-mini-breakdown">
            <span className="mini-badge mini-to-watch" title="Movies To Watch">
              <Eye size={11} /> {statusCounts?.['To Watch'] || 0} To Watch
            </span>
            <span className="mini-badge mini-watching" title="Currently Watching">
              <PlayCircle size={11} /> {statusCounts?.['Watching'] || 0} Watching
            </span>
            <span className="mini-badge mini-watched" title="Completed">
              <CheckCircle size={11} /> {statusCounts?.['Watched'] || 0} Watched
            </span>
          </div>
        </div>

        {/* Card 2: Total Hours Watched */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Screen Time Completed</span>
            <div className="stat-icon-wrap icon-cyan">
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-main-val">
            <span className="stat-number">{totalHoursWatched || 0}</span>
            <span className="stat-unit">Hours Watched</span>
          </div>
          <p className="stat-subtext">
            Sum of runtimes for all {statusCounts?.['Watched'] || 0} completed films
          </p>
        </div>

        {/* Card 3: Average Rating */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Average Watched Rating</span>
            <div className="stat-icon-wrap icon-amber">
              <Star size={18} />
            </div>
          </div>
          <div className="stat-main-val">
            <span className="stat-number">
              {averageRating > 0 ? averageRating : '—'}
            </span>
            <span className="stat-unit">{averageRating > 0 ? '/ 10' : 'No ratings yet'}</span>
          </div>
          <p className="stat-subtext">
            {averageRating > 0
              ? 'Based on your personal ratings'
              : 'Rate completed movies to see stats'}
          </p>
        </div>

        {/* Card 4: Top Watched Genre */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Top Watched Genre</span>
            <div className="stat-icon-wrap icon-emerald">
              <Award size={18} />
            </div>
          </div>
          <div className="stat-main-val">
            <span className="stat-genre-text">{topWatchedGenre || 'N/A'}</span>
          </div>
          <p className="stat-subtext">
            {topWatchedGenre !== 'N/A'
              ? `${topWatchedGenreCount} ${topWatchedGenreCount === 1 ? 'movie' : 'movies'} watched in this genre`
              : 'Complete watched films to reveal top genre'}
          </p>
        </div>
      </div>
    </section>
  );
}

