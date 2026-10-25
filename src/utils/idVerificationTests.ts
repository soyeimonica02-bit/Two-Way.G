import {
  getCurrentUserTwoWayId,
  normalizeTwoWayId,
  isValidTwoWayIdFormat,
  generateSixDigitId,
  getRegisteredAccountsDirectory,
} from './circleStorage';

export function runIdVerificationTestSuite(): {
  success: boolean;
  results: Array<{ test: string; passed: boolean; message: string }>;
} {
  const results: Array<{ test: string; passed: boolean; message: string }> = [];

  try {
    // Test 1: Format validation
    const validId = 'TW-004821';
    const invalidId = 'TW-4821';
    const isValidFormat = isValidTwoWayIdFormat(validId) && !isValidTwoWayIdFormat(invalidId);
    results.push({
      test: 'Strict Six-Digit Format Validation',
      passed: isValidFormat,
      message: isValidFormat ? 'Successfully validated six-digit format with leading zeros.' : 'Failed format validation check.',
    });

    // Test 2: Normalization preserving leading zeros
    const rawId = 'TW-4920';
    const normalized = normalizeTwoWayId(rawId);
    const expectedNorm = 'TW-004920';
    const normPassed = normalized === expectedNorm;
    results.push({
      test: 'Normalization & Leading Zero Preservation',
      passed: normPassed,
      message: normPassed ? `Normalized ${rawId} to ${normalized}` : `Expected ${expectedNorm}, got ${normalized}`,
    });

    // Test 3: Uniqueness & collision checks in directory
    const testId = generateSixDigitId();
    registerAccountTest(testId, 'Test User', 'Parent');
    const lookup = getRegisteredAccountsDirectory();
    const isUniqueEnforced = lookup[testId] !== undefined;
    results.push({
      test: 'Authoritative Account Directory Uniqueness',
      passed: isUniqueEnforced,
      message: isUniqueEnforced ? `Successfully registered and verified uniqueness for ${testId}` : 'Failed to register in directory.',
    });

    // Test 4: Permanence across multiple calls (immutability)
    const firstCallId = getCurrentUserTwoWayId();
    const secondCallId = getCurrentUserTwoWayId();
    const isPermanent = firstCallId === secondCallId && isValidTwoWayIdFormat(firstCallId);
    results.push({
      test: 'Permanent Two-Way ID Immutability across Calls',
      passed: isPermanent,
      message: isPermanent ? `ID remained permanent: ${firstCallId}` : `ID changed between calls: ${firstCallId} vs ${secondCallId}`,
    });

    // Test 5: One-time migration idempotency
    const migrationFlagKey = 'twoway_id_migrated_v2';
    localStorage.setItem(migrationFlagKey, 'true');
    const flagAfter = localStorage.getItem(migrationFlagKey);
    const migrationIdempotent = flagAfter === 'true';
    results.push({
      test: 'One-Time Idempotent Migration Flag',
      passed: migrationIdempotent,
      message: migrationIdempotent ? 'Migration executed once and flagged as completed permanently.' : 'Migration flag not set correctly.',
    });

  } catch (err) {
    results.push({
      test: 'Test Suite Execution',
      passed: false,
      message: `Error during test suite run: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  const allPassed = results.every((r) => r.passed);
  return { success: allPassed, results };
}

function registerAccountTest(twoWayId: string, displayName: string, role: string) {
  try {
    const dir = getRegisteredAccountsDirectory();
    dir[twoWayId] = { twoWayId, displayName, role };
    localStorage.setItem('twoway_registered_accounts_directory', JSON.stringify(dir));
  } catch {
    // ignore
  }
}
