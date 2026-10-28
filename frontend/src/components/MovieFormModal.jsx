import React, { useState, useEffect } from 'react';
import { X, Film, AlertCircle } from 'lucide-react';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const PLATFORMS = ['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other'];
const CURRENT_YEAR = new Date().getFullYear();

export default function MovieFormModal({ isOpen, onClose, onSubmit, initialMovie = null }) {
  const isEditMode = Boolean(initialMovie);

  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action',
    releaseYear: CURRENT_YEAR,
    runtime: 120,
    platform: 'Netflix',
    priority: 3
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form when initialMovie changes or modal opens
  useEffect(() => {
    if (initialMovie) {
      setFormData({
        title: initialMovie.title || '',
        genre: initialMovie.genre || 'Action',
        releaseYear: initialMovie.releaseYear || CURRENT_YEAR,
        runtime: initialMovie.runtime || 120,
        platform: initialMovie.platform || 'Netflix',
        priority: initialMovie.priority || 3
      });
    } else {
      setFormData({
        title: '',
        genre: 'Action',
        releaseYear: CURRENT_YEAR,
        runtime: 120,
        platform: 'Netflix',
        priority: 3
      });
    }
    setFormError('');
  }, [initialMovie, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'releaseYear' || name === 'runtime' || name === 'priority' ? Number(value) : value
    }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Frontend validations
    const cleanTitle = formData.title.trim();
    if (!cleanTitle) {
      setFormError('Title is required');
      return;
    }

    if (formData.releaseYear < 1950 || formData.releaseYear > CURRENT_YEAR) {
      setFormError(`Release Year must be between 1950 and ${CURRENT_YEAR}`);
      return;
    }

    if (formData.runtime < 30 || formData.runtime > 300) {
      setFormError('Runtime must be between 30 and 300 minutes');
      return;
    }

    if (formData.priority < 1 || formData.priority > 5) {
      setFormError('Priority must be between 1 and 5');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      // Show conflict or validation message from backend on the form
      setFormError(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Film className="modal-icon" size={20} />
            <h2 className="modal-title">
              {isEditMode ? 'Edit Movie' : 'Add Movie to Watchlist'}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Error notification banner if any */}
        {formError && (
          <div className="alert-error">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        {isEditMode && initialMovie && (
          <div className="info-banner">
            <div>
              <strong>Movie Code:</strong> <code>{initialMovie.movieCode}</code>
            </div>
            <div className="text-muted-xs">
              * Movie Code and Release Year are locked and cannot be edited.
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Movie Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Inception, The Dark Knight"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group col-half">
              <label htmlFor="genre">Genre *</label>
              <select
                id="genre"
                name="genre"
                className="form-select"
                value={formData.genre}
                onChange={handleChange}
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group col-half">
              <label htmlFor="platform">Platform *</label>
              <select
                id="platform"
                name="platform"
                className="form-select"
                value={formData.platform}
                onChange={handleChange}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-half">
              <label htmlFor="releaseYear">
                Release Year (1950 - {CURRENT_YEAR}) *
              </label>
              <input
                id="releaseYear"
                name="releaseYear"
                type="number"
                min="1950"
                max={CURRENT_YEAR}
                required
                disabled={isEditMode}
                className={`form-input ${isEditMode ? 'input-disabled' : ''}`}
                value={formData.releaseYear}
                onChange={handleChange}
              />
            </div>

            <div className="form-group col-half">
              <label htmlFor="runtime">Runtime (30 - 300 min) *</label>
              <input
                id="runtime"
                name="runtime"
                type="number"
                min="30"
                max="300"
                required
                className="form-input"
                placeholder="Minutes"
                value={formData.runtime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="priority-label-row">
              <label htmlFor="priority">Priority (1 to 5) *</label>
              <span className="priority-badge-display">Level {formData.priority}</span>
            </div>
            <input
              id="priority"
              name="priority"
              type="range"
              min="1"
              max="5"
              step="1"
              className="form-range"
              value={formData.priority}
              onChange={handleChange}
            />
            <div className="range-ticks">
              <span>1 (Low)</span>
              <span>2</span>
              <span>3 (Medium)</span>
              <span>4</span>
              <span>5 (High)</span>
            </div>
          </div>

          {/* Modal Footer */}
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Movie' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
