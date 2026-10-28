const express = require('express');
const router = express.Router();
const {
  addMovie,
  getMovies,
  getMovieById,
  updateMovie,
  updateMovieStatus,
  updateMovieRating,
  deleteMovie,
  getWatchNextMovie,
  getMovieStats
} = require('../controllers/movieController');

// Specialized query endpoints (must precede /:id)
router.get('/watch-next', getWatchNextMovie);
router.get('/stats', getMovieStats);

// Movie CRUD and workflow routes
router.post('/', addMovie);
router.get('/', getMovies);
router.get('/:id', getMovieById);
router.put('/:id', updateMovie);
router.patch('/:id/status', updateMovieStatus);
router.patch('/:id/rating', updateMovieRating);
router.delete('/:id', deleteMovie);

module.exports = router;
