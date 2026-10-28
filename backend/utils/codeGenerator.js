const Movie = require('../models/Movie');

/**
 * Generates an incrementing movie code per release year in the format:
 * MV-<release year>-<3-digit sequence> (e.g. MV-2024-001)
 *
 * @param {number} releaseYear
 * @returns {Promise<string>}
 */
async function generateMovieCode(releaseYear) {
  const prefix = `MV-${releaseYear}-`;

  // Fetch all existing movie codes for this specific release year
  const movies = await Movie.find(
    { releaseYear: Number(releaseYear) },
    { movieCode: 1 }
  ).lean();

  let maxSeq = 0;
  for (const m of movies) {
    if (m.movieCode && m.movieCode.startsWith(prefix)) {
      const suffix = m.movieCode.slice(prefix.length);
      const parsed = parseInt(suffix, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const formattedSeq = String(nextSeq).padStart(3, '0');
  return `${prefix}${formattedSeq}`;
}

module.exports = { generateMovieCode };

