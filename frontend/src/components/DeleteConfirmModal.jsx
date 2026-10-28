import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, movie, onConfirm }) {
  if (!isOpen || !movie) return null;

  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage('');
    try {
      await onConfirm(movie._id);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete movie.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-compact" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <AlertTriangle className="text-danger" size={22} />
            <h2 className="modal-title">Delete Movie</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="alert-error">
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="delete-body">
          <p>
            Are you sure you want to delete <strong>"{movie.title}"</strong> (
            <code>{movie.movieCode}</code>)?
          </p>
          <p className="text-muted-xs">
            This action cannot be undone and will permanently remove this movie from your watchlist.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 size={14} />
            <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

