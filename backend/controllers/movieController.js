const Movie = require('../models/Movie');
const { generateMovieCode } = require('../utils/codeGenerator');

const VALID_GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const VALID_PLATFORMS = ['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other'];
const CURRENT_YEAR = new Date().getFullYear();

/**
 * Helper to validate status transition workflow
 * Allowed transitions:
 * - 'To Watch' -> 'Watching' or 'Watched'
 * - 'Watching' -> 'Watched' or 'To Watch'
 * - 'Watched' -> final (no transitions allowed)
 */
function isValidStatusTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) return true;

  if (currentStatus === 'To Watch') {
    return newStatus === 'Watching' || newStatus === 'Watched';
  }
  if (currentStatus === 'Watching') {
    return newStatus === 'Watched' || newStatus === 'To Watch';
  }
  if (currentStatus === 'Watched') {
    return false; // Watched is immutable
  }
  return false;
}

/**
 * @route   POST /api/movies
 * @desc    Add a new movie to the watchlist
 */
const addMovie = async (req, res) => {
  try {
    const { title, genre, releaseYear, runtime, platform, priority } = req.body;

    // Basic presence checks
    if (!title || !genre || !releaseYear || !runtime || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, genre, releaseYear, runtime, platform',
        data: null
      });
    }

    const cleanTitle = title.trim();
    const parsedYear = Number(releaseYear);
    const parsedRuntime = Number(runtime);
    const parsedPriority = priority !== undefined ? Number(priority) : 3;

    // Validate release year (1950 to current year)
    if (isNaN(parsedYear) || parsedYear < 1950 || parsedYear > CURRENT_YEAR) {
      return res.status(400).json({
        success: false,
        message: `Release year must be between 1950 and ${CURRENT_YEAR}`,
        data: null
      });
    }

    // Validate runtime (30 to 300 minutes)
    if (isNaN(parsedRuntime) || parsedRuntime < 30 || parsedRuntime > 300) {
      return res.status(400).json({
        success: false,
        message: 'Runtime must be between 30 and 300 minutes',
        data: null
      });
    }

    // Validate genre
    if (!VALID_GENRES.includes(genre)) {
      return res.status(400).json({
        success: false,
        message: `Invalid genre. Must be one of: ${VALID_GENRES.join(', ')}`,
        data: null
      });
    }

    // Validate platform
    if (!VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}`,
        data: null
      });
    }

    // Validate priority
    if (isNaN(parsedPriority) || parsedPriority < 1 || parsedPriority > 5) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be an integer between 1 and 5',
        data: null
      });
    }

    // Duplicate check: Same Title and Release Year (case-insensitive)
    const existingMovie = await Movie.findOne({
      title: { $regex: new RegExp(`^${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      releaseYear: parsedYear
    });

    if (existingMovie) {
      return res.status(409).json({
        success: false,
        message: `A movie with title "${cleanTitle}" and release year ${parsedYear} already exists in your watchlist.`,
        data: null
      });
    }

    // Generate auto movie code (client cannot override)
    const movieCode = await generateMovieCode(parsedYear);

    const newMovie = new Movie({
      movieCode,
      title: cleanTitle,
      genre,
      releaseYear: parsedYear,
      runtime: parsedRuntime,
      platform,
      priority: parsedPriority,
      status: 'To Watch', // Every new movie starts as 'To Watch'
      rating: null,
      watchedDate: null
    });

    const savedMovie = await newMovie.save();

    return res.status(201).json({
      success: true,
      message: 'Movie added successfully to watchlist',
      data: savedMovie
    });
  } catch (error) {
    console.error('Error in addMovie:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while adding movie',
      data: null
    });
  }
};

/**
 * @route   GET /api/movies
 * @desc    Get all movies with filters, search, and pagination
 */
const getMovies = async (req, res) => {
  try {
    const { status, genre, search, page = 1, limit = 6 } = req.query;

    const query = {};

    // Filter by status if provided
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by genre if provided
    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    // Search by title (case-insensitive substring)
    if (search && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.max(1, parseInt(limit, 10) || 6);
    const skip = (pageNum - 1) * pageLimit;

    // Sorting rule:
    // Movies in 'To Watch' status must be sorted by Priority (high to low) first.
    // If filtering by To Watch or general listing, sort by priority desc, then createdAt desc.
    let sortOptions = { priority: -1, createdAt: -1 };
    if (status === 'Watched') {
      sortOptions = { watchedDate: -1, createdAt: -1 };
    }

    const totalMovies = await Movie.countDocuments(query);
    const totalPages = Math.ceil(totalMovies / pageLimit) || 1;

    const movies = await Movie.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit)
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Movies fetched successfully',
      data: {
        movies,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalMovies,
          limit: pageLimit
        }
      }
    });
  } catch (error) {
    console.error('Error in getMovies:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve movies',
      data: null
    });
  }
};

/**
 * @route   GET /api/movies/:id
 * @desc    Get a single movie by ID
 */
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Movie details retrieved',
      data: movie
    });
  } catch (error) {
    console.error('Error in getMovieById:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching movie',
      data: null
    });
  }
};

/**
 * @route   PUT /api/movies/:id
 * @desc    Edit Movie details (Title, Genre, Runtime, Platform, Priority)
 *          Movie Code and Release Year CANNOT be edited.
 */
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, genre, runtime, platform, priority } = req.body;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    // Check if client is trying to modify immutable fields
    if (req.body.movieCode && req.body.movieCode !== movie.movieCode) {
      return res.status(400).json({
        success: false,
        message: 'Movie Code is immutable and cannot be updated',
        data: null
      });
    }

    if (req.body.releaseYear && Number(req.body.releaseYear) !== movie.releaseYear) {
      return res.status(400).json({
        success: false,
        message: 'Release Year is immutable and cannot be updated',
        data: null
      });
    }

    // Validate fields if provided
    if (genre && !VALID_GENRES.includes(genre)) {
      return res.status(400).json({
        success: false,
        message: `Invalid genre. Must be one of: ${VALID_GENRES.join(', ')}`,
        data: null
      });
    }

    if (platform && !VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}`,
        data: null
      });
    }

    if (runtime !== undefined) {
      const parsedRuntime = Number(runtime);
      if (isNaN(parsedRuntime) || parsedRuntime < 30 || parsedRuntime > 300) {
        return res.status(400).json({
          success: false,
          message: 'Runtime must be between 30 and 300 minutes',
          data: null
        });
      }
      movie.runtime = parsedRuntime;
    }

    if (priority !== undefined) {
      const parsedPriority = Number(priority);
      if (isNaN(parsedPriority) || parsedPriority < 1 || parsedPriority > 5) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be between 1 and 5',
          data: null
        });
      }
      movie.priority = parsedPriority;
    }

    if (title && title.trim() !== '') {
      const cleanTitle = title.trim();

      // Check duplicate rule against other records
      const duplicate = await Movie.findOne({
        _id: { $ne: id },
        title: { $regex: new RegExp(`^${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        releaseYear: movie.releaseYear
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Another movie with title "${cleanTitle}" and release year ${movie.releaseYear} already exists.`,
          data: null
        });
      }

      movie.title = cleanTitle;
    }

    if (genre) movie.genre = genre;
    if (platform) movie.platform = platform;

    const updatedMovie = await movie.save();

    return res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: updatedMovie
    });
  } catch (error) {
    console.error('Error in updateMovie:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating movie',
      data: null
    });
  }
};

/**
 * @route   PATCH /api/movies/:id/status
 * @desc    Transition movie status with workflow checks and mandatory rating on Watched
 */
const updateMovieStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: targetStatus, rating } = req.body;

    if (!targetStatus) {
      return res.status(400).json({
        success: false,
        message: 'Target status is required',
        data: null
      });
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    const currentStatus = movie.status;

    // Check if status is already Watched
    if (currentStatus === 'Watched') {
      return res.status(400).json({
        success: false,
        message: 'Watched status is final and cannot be changed.',
        data: null
      });
    }

    // Validate workflow transition
    if (!isValidStatusTransition(currentStatus, targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${currentStatus}" to "${targetStatus}".`,
        data: null
      });
    }

    // Rating rule:
    // Moving to 'Watched' requires mandatory rating (1 to 10) and automatically stores watchedDate
    if (targetStatus === 'Watched') {
      const parsedRating = Number(rating);
      if (rating === undefined || rating === null || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10) {
        return res.status(400).json({
          success: false,
          message: 'A rating between 1 and 10 is mandatory when marking a movie as Watched.',
          data: null
        });
      }
      movie.rating = parsedRating;
      movie.watchedDate = new Date();
    } else {
      // If moving back to 'To Watch' or 'Watching', rating is not permitted
      if (rating !== undefined && rating !== null) {
        return res.status(400).json({
          success: false,
          message: 'Rating is only permitted for movies in Watched status.',
          data: null
        });
      }
      movie.rating = null;
      movie.watchedDate = null;
    }

    movie.status = targetStatus;
    const savedMovie = await movie.save();

    return res.status(200).json({
      success: true,
      message: `Movie status updated to "${targetStatus}" successfully`,
      data: savedMovie
    });
  } catch (error) {
    console.error('Error in updateMovieStatus:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating movie status',
      data: null
    });
  }
};

/**
 * @route   PATCH /api/movies/:id/rating
 * @desc    Edit rating for already Watched movies
 */
const updateMovieRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    // Rating can be edited later ONLY for Watched movies
    if (movie.status !== 'Watched') {
      return res.status(400).json({
        success: false,
        message: 'Rating can only be updated for movies in Watched status',
        data: null
      });
    }

    const parsedRating = Number(rating);
    if (rating === undefined || rating === null || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 10',
        data: null
      });
    }

    movie.rating = parsedRating;
    const savedMovie = await movie.save();

    return res.status(200).json({
      success: true,
      message: 'Movie rating updated successfully',
      data: savedMovie
    });
  } catch (error) {
    console.error('Error in updateMovieRating:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating rating',
      data: null
    });
  }
};

/**
 * @route   DELETE /api/movies/:id
 * @desc    Delete movie (Movies in 'Watching' status cannot be deleted)
 */
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    // Delete rule: A movie in Watching status cannot be deleted
    if (movie.status === 'Watching') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a movie currently in Watching status. Please update its status first.',
        data: null
      });
    }

    await Movie.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Movie "${movie.title}" deleted successfully`,
      data: { id: movie._id, movieCode: movie.movieCode }
    });
  } catch (error) {
    console.error('Error in deleteMovie:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting movie',
      data: null
    });
  }
};

/**
 * @route   GET /api/movies/watch-next
 * @desc    Get the To Watch movie with the highest priority (tie-break by shortest runtime)
 */
const getWatchNextMovie = async (req, res) => {
  try {
    const nextMovie = await Movie.findOne({ status: 'To Watch' })
      .sort({ priority: -1, runtime: 1, createdAt: 1 })
      .lean();

    if (!nextMovie) {
      return res.status(404).json({
        success: false,
        message: 'No movies in "To Watch" status found. Add some movies to your watchlist!',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Next movie recommendation found',
      data: nextMovie
    });
  } catch (error) {
    console.error('Error in getWatchNextMovie:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching watch next recommendation',
      data: null
    });
  }
};

/**
 * @route   GET /api/movies/stats
 * @desc    Aggregate watchlist statistics (status counts, total hours, avg rating, top genre)
 */
const getMovieStats = async (req, res) => {
  try {
    // 1. Total movies in each status
    const statusCounts = await Movie.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = {
      'To Watch': 0,
      'Watching': 0,
      'Watched': 0
    };

    statusCounts.forEach((item) => {
      if (item._id && Object.prototype.hasOwnProperty.call(statusMap, item._id)) {
        statusMap[item._id] = item.count;
      }
    });

    // 2. Watched metrics: total runtime (in hours) and average rating
    const watchedStats = await Movie.aggregate([
      { $match: { status: 'Watched' } },
      {
        $group: {
          _id: null,
          totalRuntimeMinutes: { $sum: '$runtime' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    let totalHoursWatched = 0;
    let averageRating = 0;

    if (watchedStats.length > 0) {
      const { totalRuntimeMinutes, avgRating } = watchedStats[0];
      totalHoursWatched = parseFloat(((totalRuntimeMinutes || 0) / 60).toFixed(1));
      averageRating = avgRating ? parseFloat(avgRating.toFixed(1)) : 0;
    }

    // 3. Genre with the most Watched movies
    const topGenreAgg = await Movie.aggregate([
      { $match: { status: 'Watched' } },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 1 }
    ]);

    const topWatchedGenre = topGenreAgg.length > 0 ? topGenreAgg[0]._id : 'N/A';
    const topWatchedGenreCount = topGenreAgg.length > 0 ? topGenreAgg[0].count : 0;

    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics calculated successfully',
      data: {
        statusCounts: statusMap,
        totalMovies: statusMap['To Watch'] + statusMap['Watching'] + statusMap['Watched'],
        totalHoursWatched,
        averageRating,
        topWatchedGenre,
        topWatchedGenreCount
      }
    });
  } catch (error) {
    console.error('Error in getMovieStats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error generating statistics',
      data: null
    });
  }
};

module.exports = {
  addMovie,
  getMovies,
  getMovieById,
  updateMovie,
  updateMovieStatus,
  updateMovieRating,
  deleteMovie,
  getWatchNextMovie,
  getMovieStats
};

