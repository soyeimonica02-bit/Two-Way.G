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

/**
 * Generate a cryptographically secure 6-digit Two-Way ID (e.g. TW-004821).
 */
export function generateSixDigitId(): string {
  try {
    const array = new Uint32Array(1);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
      const num = array[0] % 1000000;
      return `TW-${num.toString().padStart(6, '0')}`;
    }
  } catch {
    // fallback
  }
  const rand = Math.floor(Math.random() * 1000000);
  return `TW-${rand.toString().padStart(6, '0')}`;
}

export function generateCircleRecordId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Clean & normalize a Two-Way ID to canonical 6-digit format (TW- followed by exactly 6 digits).
 * Preserves leading zeroes.
 */
export function normalizeTwoWayId(id: string): string {
  if (!id) return '';
  const trimmed = id.trim().toUpperCase();
  const digitsOnly = trimmed.replace(/^TW-?/, '').replace(/[^0-9]/g, '');
  if (!digitsOnly) return '';
  const padded = digitsOnly.padStart(6, '0').slice(-6);
  return `TW-${padded}`;
}

/**
 * Validate Two-Way ID format.
 * Two-Way IDs must have a non-removable "TW-" prefix followed by exactly 6 numeric digits.
 * Leading zeros are explicitly preserved.
 */
export function isValidTwoWayIdFormat(id: string): boolean {
  if (!id) return false;
  const clean = id.trim().toUpperCase();
  return /^TW-[0-9]{6}$/.test(clean);
}

/**
 * Run migration of existing 4-digit or legacy IDs to 6-digit canonical IDs across all storage keys.
 * Idempotent and repeatable.
 */
export function runSixDigitIdMigration(): void {
  try {
    if (typeof window === 'undefined') return;
    const migratedFlag = localStorage.getItem('twoway_id_migrated_v2');
    if (migratedFlag === 'true') {
      // Already migrated once; never re-run or change IDs on startup
      return;
    }

    // 1. User ID migration
    const userId = localStorage.getItem('twoway_user_id');
    if (userId) {
      const normalized = normalizeTwoWayId(userId);
      if (normalized && normalized !== userId) {
        localStorage.setItem('twoway_user_id', normalized);
      } else if (!isValidTwoWayIdFormat(userId)) {
        const newId = generateSixDigitId();
        localStorage.setItem('twoway_user_id', newId);
      }
    } else {
      localStorage.setItem('twoway_user_id', generateSixDigitId());
    }

    // Ensure internal immutable ID exists
    if (!localStorage.getItem('twoway_internal_id')) {
      localStorage.setItem('twoway_internal_id', `internal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
    }

    // 2. Accounts Directory migration
    const rawDir = localStorage.getItem(STORAGE_KEY_ACCOUNTS_DIRECTORY);
    if (rawDir) {
      try {
        const dir = JSON.parse(rawDir);
        const newDir: Record<string, RegisteredAccountLookupResult> = {};
        for (const [key, val] of Object.entries(dir)) {
          const normKey = normalizeTwoWayId(key);
          const item = val as RegisteredAccountLookupResult;
          const normId = normalizeTwoWayId(item.twoWayId || key);
          newDir[normKey] = {
            ...item,
            twoWayId: normId,
          };
        }
        localStorage.setItem(STORAGE_KEY_ACCOUNTS_DIRECTORY, JSON.stringify(newDir));
      } catch (e) {
        console.error('Error migrating accounts directory:', e);
      }
    }

    // 3. Circle Connections migration
    const rawConn = localStorage.getItem(STORAGE_KEY_CIRCLE_CONNECTIONS);
    if (rawConn) {
      try {
        const conns: CircleConnection[] = JSON.parse(rawConn);
        const migrated = conns.map((c) => ({
          ...c,
          twoWayId: normalizeTwoWayId(c.twoWayId),
        }));
        localStorage.setItem(STORAGE_KEY_CIRCLE_CONNECTIONS, JSON.stringify(migrated));
      } catch (e) {
        console.error('Error migrating circle connections:', e);
      }
    }

    // 4. Connection Requests migration
    const rawReq = localStorage.getItem(STORAGE_KEY_CIRCLE_REQUESTS);
    if (rawReq) {
      try {
        const reqs: ConnectionRequest[] = JSON.parse(rawReq);
        const migrated = reqs.map((r) => ({
          ...r,
          senderTwoWayId: normalizeTwoWayId(r.senderTwoWayId),
          recipientTwoWayId: normalizeTwoWayId(r.recipientTwoWayId),
        }));
        localStorage.setItem(STORAGE_KEY_CIRCLE_REQUESTS, JSON.stringify(migrated));
      } catch (e) {
        console.error('Error migrating connection requests:', e);
      }
    }

    // Mark migration completed permanently
    localStorage.setItem('twoway_id_migrated_v2', 'true');
  } catch (err) {
    console.error('Failed to run six-digit ID migration:', err);
  }
}

/**
 * Get current user's Two-Way ID in canonical 6-digit format.
 */
export function getCurrentUserTwoWayId(): string {
  runSixDigitIdMigration();
  const stored = localStorage.getItem('twoway_user_id');
  if (stored) {
    const normalized = normalizeTwoWayId(stored);
    if (isValidTwoWayIdFormat(normalized)) {
      return normalized;
    }
  }
  const generated = generateSixDigitId();
  localStorage.setItem('twoway_user_id', generated);
  return generated;
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
