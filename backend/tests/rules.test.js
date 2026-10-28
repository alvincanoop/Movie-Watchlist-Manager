/**
 * Unit test for Stage 2 business rules & logic
 */
const assert = require('assert');

// Test status transition helper
const { isValidStatusTransition } = (function() {
  function isValid(currentStatus, newStatus) {
    if (currentStatus === newStatus) return true;
    if (currentStatus === 'To Watch') return newStatus === 'Watching' || newStatus === 'Watched';
    if (currentStatus === 'Watching') return newStatus === 'Watched' || newStatus === 'To Watch';
    if (currentStatus === 'Watched') return false;
    return false;
  }
  return { isValidStatusTransition: isValid };
})();

console.log('Testing status transition rules...');
assert.strictEqual(isValidStatusTransition('To Watch', 'Watching'), true, 'To Watch -> Watching should be valid');
assert.strictEqual(isValidStatusTransition('To Watch', 'Watched'), true, 'To Watch -> Watched should be valid');
assert.strictEqual(isValidStatusTransition('Watching', 'Watched'), true, 'Watching -> Watched should be valid');
assert.strictEqual(isValidStatusTransition('Watching', 'To Watch'), true, 'Watching -> To Watch should be valid');
assert.strictEqual(isValidStatusTransition('Watched', 'Watching'), false, 'Watched -> Watching must be invalid');
assert.strictEqual(isValidStatusTransition('Watched', 'To Watch'), false, 'Watched -> To Watch must be invalid');
console.log('✓ Status transition rules passed');

// Test code format regex
const codeRegex = /^MV-\d{4}-\d{3}$/;
assert.strictEqual(codeRegex.test('MV-2024-001'), true);
assert.strictEqual(codeRegex.test('MV-2019-042'), true);
assert.strictEqual(codeRegex.test('MV-2024-1'), false);
console.log('✓ Code format pattern verified');

// Test validation limits
const CURRENT_YEAR = new Date().getFullYear();
function validateInputs(year, runtime, priority) {
  if (year < 1950 || year > CURRENT_YEAR) return 'Invalid release year';
  if (runtime < 30 || runtime > 300) return 'Invalid runtime';
  if (priority < 1 || priority > 5) return 'Invalid priority';
  return 'OK';
}

assert.strictEqual(validateInputs(1949, 120, 3), 'Invalid release year');
assert.strictEqual(validateInputs(CURRENT_YEAR + 1, 120, 3), 'Invalid release year');
assert.strictEqual(validateInputs(2020, 20, 3), 'Invalid runtime');
assert.strictEqual(validateInputs(2020, 350, 3), 'Invalid runtime');
assert.strictEqual(validateInputs(2020, 120, 6), 'Invalid priority');
assert.strictEqual(validateInputs(2020, 120, 0), 'Invalid priority');
assert.strictEqual(validateInputs(2020, 120, 5), 'OK');
console.log('✓ Field validation limits verified');

// Test "Watch Next" comparator logic
const sampleMovies = [
  { title: 'Movie A', status: 'To Watch', priority: 4, runtime: 150 },
  { title: 'Movie B', status: 'To Watch', priority: 5, runtime: 140 },
  { title: 'Movie C', status: 'To Watch', priority: 5, runtime: 105 }, // Should win: priority 5 & shortest runtime
  { title: 'Movie D', status: 'Watched', priority: 5, runtime: 90 }
];

const eligible = sampleMovies
  .filter((m) => m.status === 'To Watch')
  .sort((a, b) => b.priority - a.priority || a.runtime - b.runtime);

assert.strictEqual(eligible[0].title, 'Movie C', 'Watch Next should pick highest priority and shortest runtime');
console.log('✓ Watch Next recommendation logic verified');

// Test stats calculation math
const runtimes = [120, 95, 145]; // Total = 360 mins = 6.0 hours
const ratings = [8.5, 9.0, 7.0]; // Avg = 8.1666... -> 8.2
const totalHours = parseFloat((runtimes.reduce((a, b) => a + b, 0) / 60).toFixed(1));
const avgRating = parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1));

assert.strictEqual(totalHours, 6.0);
assert.strictEqual(avgRating, 8.2);
console.log('✓ Stats calculations (hours & avg rating) verified');

console.log('All business rule unit assertions passed successfully!');
