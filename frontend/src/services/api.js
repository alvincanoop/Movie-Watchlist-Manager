/**
 * API service layer for Movie Watchlist Manager
 * Communicates with Express backend
 */

const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const BASE_URL = `${API_ROOT}/api/movies`;

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';

    let result;
    if (contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Expected JSON but received ${contentType} (${response.status}) from ${url}`);
    }

    if (!response.ok) {
      const error = new Error(result.message || 'API request failed');
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (error) {
    if (error.status) throw error;
    // Network or server unreachable error
    const networkError = new Error(error.message || 'Unable to connect to server. Check backend.');
    networkError.status = 503;
    throw networkError;
  }
}

export const movieApi = {
  // Fetch movies with filters & pagination
  getMovies: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.genre && params.genre !== 'All') query.append('genre', params.genre);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    return request(`/?${queryString}`);
  },

  // Get single movie
  getMovieById: (id) => request(`/${id}`),

  // Add new movie
  addMovie: (movieData) =>
    request('/', {
      method: 'POST',
      body: JSON.stringify(movieData)
    }),

  // Update movie (Title, Genre, Runtime, Platform, Priority)
  updateMovie: (id, updateData) =>
    request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    }),

  // Transition status (requires rating if status is Watched)
  updateStatus: (id, status, rating = null) =>
    request(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rating })
    }),

  // Update rating for Watched movie
  updateRating: (id, rating) =>
    request(`/${id}/rating`, {
      method: 'PATCH',
      body: JSON.stringify({ rating })
    }),

  // Delete movie
  deleteMovie: (id) =>
    request(`/${id}`, {
      method: 'DELETE'
    }),

  // "What should I watch next?" recommendation
  getWatchNext: () => request('/watch-next'),

  // Aggregate statistics
  getStats: () => request('/stats')
};

