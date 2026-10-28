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

console.log('All business rule unit assertions passed successfully!');
