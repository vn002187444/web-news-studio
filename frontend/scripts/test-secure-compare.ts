import { secureCompare } from '../src/lib/security';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('Running secureCompare tests...');

  // Basic equality
  assert(secureCompare('secret123', 'secret123') === true, 'Exact match should return true');

  // Basic inequality
  assert(secureCompare('secret123', 'secret124') === false, 'Different string of same length should return false');
  assert(secureCompare('secret123', 'secret') === false, 'Shorter string should return false');
  assert(secureCompare('secret', 'secret123') === false, 'Longer string should return false');

  // Edge cases
  assert(secureCompare('', '') === true, 'Empty strings should match');
  assert(secureCompare('', 'a') === false, 'Empty string vs non-empty should not match');
  assert(secureCompare('a', '') === false, 'Non-empty vs empty string should not match');

  // Prefix matching
  assert(secureCompare('admin_token', 'admin_token_extra') === false, 'Prefix match should fail');
  assert(secureCompare('admin_token_extra', 'admin_token') === false, 'Prefix match should fail reversed');

  // Similar characters
  assert(secureCompare('0', 'O') === false, 'Similar looking characters should not match');
  assert(secureCompare('l', '1') === false, 'Similar looking characters should not match');

  console.log('All tests passed successfully!');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
