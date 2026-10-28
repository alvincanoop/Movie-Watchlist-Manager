const mongoose = require('mongoose');

const currentYear = new Date().getFullYear();

const movieSchema = new mongoose.Schema(
  {
    movieCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: {
        values: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'],
        message: '{VALUE} is not a valid genre'
      }
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
      min: [1950, 'Release year cannot be earlier than 1950'],
      max: [currentYear, `Release year cannot exceed current year (${currentYear})`]
    },
    runtime: {
      type: Number,
      required: [true, 'Runtime is required'],
      min: [30, 'Runtime must be at least 30 minutes'],
      max: [300, 'Runtime cannot exceed 300 minutes']
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: ['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other'],
        message: '{VALUE} is not a supported platform'
      }
    },
    priority: {
      type: Number,
      required: [true, 'Priority is required'],
      min: [1, 'Priority must be between 1 and 5'],
      max: [5, 'Priority must be between 1 and 5'],
      default: 3
    },
    status: {
      type: String,
      enum: ['To Watch', 'Watching', 'Watched'],
      default: 'To Watch'
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot exceed 10'],
      default: null
    },
    watchedDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index on lowercased title and release year for fast duplicate lookups
movieSchema.index(
  { title: 1, releaseYear: 1 },
  { collation: { locale: 'en', strength: 2 } }
);

module.exports = mongoose.model('Movie', movieSchema);
