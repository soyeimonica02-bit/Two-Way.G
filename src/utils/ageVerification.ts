/**
 * Two-Way Age Verification & Policy Engine
 * 
 * Policy:
 * - Teen experience: ages 13–19 inclusive.
 * - Parent experience: no upper age limit.
 * - Users below 13 or aged 20 and above must not access the teen experience.
 * - Age calculation handles calendar day boundaries precisely.
 */

export type RoleType = 'teen' | 'parent';

export type TeenEligibilityStatus =
  | 'eligible'          // Age 13-19 inclusive
  | 'underage'          // Age < 13 (blocked)
  | 'aged_out'          // Age >= 20 (restricted read-only)
  | 'unverified';       // Missing or unverified date of birth

export interface AgeCalculationResult {
  birthDate: string; // YYYY-MM-DD
  age: number;
  eligibilityStatus: TeenEligibilityStatus;
  isEligibleTeen: boolean;
  isAgedOut: boolean;
  message?: string;
}

/**
 * Calculates exact age using calendar year, month, and day.
 * Correctly accounts for whether the birthday has occurred as of the reference date.
 */
export function calculatePreciseAge(birthDateStr: string, asOfDate: Date = new Date()): number {
  if (!birthDateStr || typeof birthDateStr !== 'string') {
    throw new Error('Birth date string is required.');
  }

  const parts = birthDateStr.trim().split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid birth date format: "${birthDateStr}". Expected YYYY-MM-DD.`);
  }

  const [bYear, bMonth, bDay] = parts;
  if (bMonth < 1 || bMonth > 12 || bDay < 1 || bDay > 31) {
    throw new Error(`Invalid birth date values: month=${bMonth}, day=${bDay}.`);
  }

  const cYear = asOfDate.getFullYear();
  const cMonth = asOfDate.getMonth() + 1; // getMonth() is 0-indexed
  const cDay = asOfDate.getDate();

  let age = cYear - bYear;

  // If the birthday has not arrived yet this calendar year, decrement age
  if (cMonth < bMonth || (cMonth === bMonth && cDay < bDay)) {
    age--;
  }

  return age;
}

/**
 * Evaluates teen eligibility based on birth date string (YYYY-MM-DD).
 */
export function evaluateTeenEligibility(
  birthDateStr: string | null | undefined,
  asOfDate: Date = new Date()
): AgeCalculationResult {
  if (!birthDateStr) {
    return {
      birthDate: '',
      age: -1,
      eligibilityStatus: 'unverified',
      isEligibleTeen: false,
      isAgedOut: false,
      message: 'Date of birth has not been verified.',
    };
  }

  let age: number;
  try {
    age = calculatePreciseAge(birthDateStr, asOfDate);
  } catch (err) {
    return {
      birthDate: birthDateStr,
      age: -1,
      eligibilityStatus: 'unverified',
      isEligibleTeen: false,
      isAgedOut: false,
      message: (err as Error).message,
    };
  }

  if (age < 0) {
    return {
      birthDate: birthDateStr,
      age,
      eligibilityStatus: 'unverified',
      isEligibleTeen: false,
      isAgedOut: false,
      message: 'Date of birth cannot be in the future.',
    };
  }

  if (age < 13) {
    return {
      birthDate: birthDateStr,
      age,
      eligibilityStatus: 'underage',
      isEligibleTeen: false,
      isAgedOut: false,
      message: 'Two-Way is available for teens aged 13–19.',
    };
  }

  if (age >= 20) {
    return {
      birthDate: birthDateStr,
      age,
      eligibilityStatus: 'aged_out',
      isEligibleTeen: false,
      isAgedOut: true,
      message: 'At age 20, teen accounts transition to a restricted read-only state.',
    };
  }

  // 13 <= age <= 19
  return {
    birthDate: birthDateStr,
    age,
    eligibilityStatus: 'eligible',
    isEligibleTeen: true,
    isAgedOut: false,
  };
}

export const AGE_OUT_BANNER_MESSAGE =
  'Account Transition Notice: At age 20, teen accounts transition to a restricted read-only state. Your personal history, past journal entries, and reflections remain safely preserved for your reference, but creating new entries is closed. Thank you for being part of Two-Way.';

/**
 * Client-side helper to check teen age status from storage.
 */
export function getCurrentTeenAgeStatus(): AgeCalculationResult {
  const dob =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem('twoway_registered_dob') ||
        window.localStorage.getItem('twoway_signup_dob')
      : null;

  return evaluateTeenEligibility(dob, new Date());
}

/**
 * Re-validates authenticated session with backend API.
 */
export async function syncServerAgeSession(): Promise<{
  authenticated: boolean;
  isAgedOut: boolean;
  canCreateContent: boolean;
  message?: string;
} | null> {
  if (typeof window === 'undefined' || !window.fetch) return null;

  try {
    const token = window.localStorage.getItem('twoway_session_token');
    const res = await fetch('/api/auth/session', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
      authenticated: !!data.authenticated,
      isAgedOut: !!data.user?.isAgedOut,
      canCreateContent: data.user?.canCreateContent ?? true,
      message: data.user?.message,
    };
  } catch {
    return null;
  }
}

