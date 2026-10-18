export interface CircleConnection {
  id: string; // Connection record ID
  twoWayId: string; // The peer's Two-Way ID
  displayName?: string; // Permitted profile display name
  role?: string;
  connectedAt: string;
}

export interface ConnectionRequest {
  id: string;
  senderTwoWayId: string;
  recipientTwoWayId: string;
  senderName?: string;
  senderRole?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface RegisteredAccountLookupResult {
  twoWayId: string;
  displayName: string;
  role: string;
}

export const STORAGE_KEY_CIRCLE_CONNECTIONS = 'twoway_circle_connections';
export const STORAGE_KEY_CIRCLE_REQUESTS = 'twoway_circle_requests';
export const STORAGE_KEY_ACCOUNTS_DIRECTORY = 'twoway_registered_accounts_directory';

export function generateCircleRecordId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Clean & normalize a Two-Way ID to canonical format.
 * Canonical format is always "TW-" followed by numeric digits (e.g. "TW-4920", "TW-0142").
 * Preserves leading zeroes.
 */
export function normalizeTwoWayId(id: string): string {
  const trimmed = id.trim().toUpperCase();
  // Strip any accidental leading "TW-" or "TW" prefix to extract the raw digits
  const digitsOnly = trimmed.replace(/^TW-?/, '').replace(/[^0-9]/g, '');
  return digitsOnly ? `TW-${digitsOnly}` : '';
}

/**
 * Validate Two-Way ID format.
 * Two-Way IDs must have a non-removable "TW-" prefix followed by 3 to 8 numeric digits.
 * Leading zeros are explicitly preserved.
 */
export function isValidTwoWayIdFormat(id: string): boolean {
  const clean = id.trim().toUpperCase();
  // Match TW- followed by 3 to 8 decimal digits
  return /^TW-[0-9]{3,8}$/.test(clean);
}

/**
 * Get current user's Two-Way ID in canonical format.
 */
export function getCurrentUserTwoWayId(): string {
  const stored = localStorage.getItem('twoway_user_id');
  if (stored) {
    const normalized = normalizeTwoWayId(stored);
    if (isValidTwoWayIdFormat(normalized)) {
      return normalized;
    }
  }
  return 'TW-4920';
}

/**
 * Registered accounts directory helper.
 * Maintains registered accounts so real user lookup can be performed without mock/fake data.
 */
export function getRegisteredAccountsDirectory(): Record<string, RegisteredAccountLookupResult> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS_DIRECTORY);
    const directory: Record<string, RegisteredAccountLookupResult> = raw ? JSON.parse(raw) : {};

    // Ensure the current user's verified account is in the directory
    const myId = getCurrentUserTwoWayId();
    const myName = localStorage.getItem('twoway_profile_name') || 'Teen';
    const myRole = localStorage.getItem('twoway_registered_role') || 'Teen';
    if (!directory[myId]) {
      directory[myId] = {
        twoWayId: myId,
        displayName: myName,
        role: myRole === 'teen' ? 'Teenager' : myRole,
      };
      localStorage.setItem(STORAGE_KEY_ACCOUNTS_DIRECTORY, JSON.stringify(directory));
    }

    return directory;
  } catch (err) {
    console.error('Failed to get registered accounts directory:', err);
    return {};
  }
}

/**
 * Register or update an account in the directory
 */
export function registerAccountInDirectory(account: RegisteredAccountLookupResult): void {
  try {
    const directory = getRegisteredAccountsDirectory();
    directory[account.twoWayId] = account;
    localStorage.setItem(STORAGE_KEY_ACCOUNTS_DIRECTORY, JSON.stringify(directory));
  } catch (err) {
    console.error('Failed to register account in directory:', err);
  }
}

/**
 * Lookup an account by Two-Way ID from the registered accounts registry.
 * Returns only permitted profile information (Two-Way ID, Display Name, Role).
 * Never exposes email, private journals, thoughts, or mood data.
 */
export function lookupRegisteredAccount(targetId: string): RegisteredAccountLookupResult | null {
  const normalized = normalizeTwoWayId(targetId);
  const directory = getRegisteredAccountsDirectory();
  return directory[normalized] || null;
}

/**
 * Load accepted circle connections
 */
export function loadCircleConnections(): CircleConnection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CIRCLE_CONNECTIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load circle connections:', err);
    return [];
  }
}

/**
 * Save circle connections
 */
export function saveCircleConnections(connections: CircleConnection[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CIRCLE_CONNECTIONS, JSON.stringify(connections));
  } catch (err) {
    console.error('Failed to save circle connections:', err);
  }
}

/**
 * Load connection requests (sent or received)
 */
export function loadConnectionRequests(): ConnectionRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CIRCLE_REQUESTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load connection requests:', err);
    return [];
  }
}

/**
 * Save connection requests
 */
export function saveConnectionRequests(requests: ConnectionRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CIRCLE_REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save connection requests:', err);
  }
}
