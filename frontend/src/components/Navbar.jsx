import React from 'react';
import { Film, PlusCircle, Compass } from 'lucide-react';

export default function Navbar({ onOpenAddModal, onOpenWatchNextModal }) {
  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <div className="brand-group">
          <div className="logo-icon-wrap">
            <Film className="logo-icon" size={24} />
          </div>
          <div>
            <h1 className="brand-title">CineTrack</h1>
            <p className="brand-tagline">Movie Watchlist Manager</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="nav-actions">
          <button
            type="button"
            className="btn btn-magic"
            onClick={onOpenWatchNextModal}
            title="Get instant recommendation on what to watch next"
          >
            <Compass size={18} />
            <span>What to Watch Next?</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddModal}
            title="Add a new movie to watchlist"
          >
            <PlusCircle size={18} />
            <span>Add Movie</span>
          </button>
        </div>
      </div>
    </header>
  );
}
