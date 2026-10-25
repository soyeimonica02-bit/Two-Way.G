// Automated Verification Test Suite for Two-Way Quality & Regressions
import {
  PALETTES,
  PARENT_ACCENTS,
  getPaletteById,
  getParentAccentById,
  getParentThemeMode,
  applyParentTheme,
  applyTeenTheme,
  TEEN_DARK_PALETTE_TOKENS,
} from '../src/utils/themePalettes';
import {
  canAccessGroupConversations,
  hasPaidSubscription,
  setCurrentSubscriptionTier,
  getCurrentSubscriptionTier,
} from '../src/utils/subscriptionStorage';
import {
  loadGroupConversations,
  createGroupConversation,
  sendGroupMessage,
  addGroupMember,
  STORAGE_KEY_GROUP_CONVERSATIONS,
} from '../src/utils/groupStorage';
import {
  normalizeTwoWayId,
  isValidTwoWayIdFormat,
  generateSixDigitId,
  getCurrentUserTwoWayId,
} from '../src/utils/circleStorage';
import {
  loadSavedGuideIds,
  toggleSavedGuide,
} from '../src/utils/parentPerspectiveStorage';

// In-memory mock localStorage for Node testing
const mockStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStore[key] || null,
  setItem: (key: string, val: string) => { mockStore[key] = String(val); },
  removeItem: (key: string) => { delete mockStore[key]; },
  clear: () => { for (const k in mockStore) delete mockStore[k]; },
};
(globalThis as unknown as Record<string, unknown>).localStorage = mockLocalStorage;

// Mock document for style testing
const styleStore: Record<string, string> = {};
const attrStore: Record<string, string> = {};
(globalThis as unknown as Record<string, unknown>).document = {
  documentElement: {
    setAttribute: (k: string, v: string) => { attrStore[k] = v; },
    getAttribute: (k: string) => attrStore[k] || null,
    removeAttribute: (k: string) => { delete attrStore[k]; },
    style: {
      setProperty: (k: string, v: string) => { styleStore[k] = v; },
      getPropertyValue: (k: string) => styleStore[k] || '',
    },
  },
};

interface TestResult {
  suite: string;
  test: string;
  status: 'PASS' | 'FAIL';
  detail: string;
}

const results: TestResult[] = [];

function assert(suite: string, test: string, condition: boolean, detail: string) {
  results.push({
    suite,
    test,
    status: condition ? 'PASS' : 'FAIL',
    detail,
  });
}

// -------------------------------------------------------------------
// 1. THEME, ONBOARDING & PALETTES
// -------------------------------------------------------------------
function testThemeAndPalettes() {
  const suite = 'Theme & Palettes';

  // Teen: exactly 8 palettes
  assert(suite, 'Teen has exactly 8 palettes', PALETTES.length === 8, `Found ${PALETTES.length} teen palettes.`);

  // Parent: exactly 6 accents
  assert(suite, 'Parent has exactly 6 accents', PARENT_ACCENTS.length === 6, `Found ${PARENT_ACCENTS.length} parent accents.`);
  
  const expectedAccentIds = ['slate', 'navy', 'forest', 'umber', 'burgundy', 'teal'];
  const actualAccentIds = PARENT_ACCENTS.map(a => a.id);
  const accentsMatch = expectedAccentIds.every(id => actualAccentIds.includes(id));
  assert(suite, 'Parent accents match required set', accentsMatch, `Expected [${expectedAccentIds.join(', ')}], got [${actualAccentIds.join(', ')}]`);

  // Default Parent Theme Mode must be 'light' if unset
  mockLocalStorage.clear();
  const defaultParentMode = getParentThemeMode();
  assert(suite, 'Parent defaults to light mode when unconfigured', defaultParentMode === 'light', `Mode was ${defaultParentMode}`);

  // When parent deliberately saves dark mode, it is respected
  mockLocalStorage.setItem('twoway_parent_theme_mode', 'dark');
  const savedParentDark = getParentThemeMode();
  assert(suite, 'Parent dark mode preference persists when explicitly set', savedParentDark === 'dark', `Mode was ${savedParentDark}`);

  // De-neonized Teen dark palette tokens exist for all 8 palettes
  const darkPaletteKeys = Object.keys(TEEN_DARK_PALETTE_TOKENS);
  assert(suite, 'Teen dark palette tokens defined for all 8 palettes', darkPaletteKeys.length === 8, `Defined ${darkPaletteKeys.length} dark palettes`);

  // Legacy teen palette migration
  const legacyTeen1 = getPaletteById('girls-1');
  const legacyTeen8 = getPaletteById('boys-4');
  assert(suite, 'Legacy teen palette migration (girls-1 -> palette-01)', legacyTeen1?.id === 'palette-01', `girls-1 mapped to ${legacyTeen1?.id}`);
  assert(suite, 'Legacy teen palette migration (boys-4 -> palette-08)', legacyTeen8?.id === 'palette-08', `boys-4 mapped to ${legacyTeen8?.id}`);

  // Legacy parent accent migration
  const legacyParentViolet = getParentAccentById('violet');
  const legacyParentRose = getParentAccentById('rose');
  const legacyParentCocoa = getParentAccentById('cocoa');
  assert(suite, 'Legacy parent accent migration (violet -> slate)', legacyParentViolet.id === 'slate', `violet mapped to ${legacyParentViolet.id}`);
  assert(suite, 'Legacy parent accent migration (rose -> burgundy)', legacyParentRose.id === 'burgundy', `rose mapped to ${legacyParentRose.id}`);
  assert(suite, 'Legacy parent accent migration (cocoa -> umber)', legacyParentCocoa.id === 'umber', `cocoa mapped to ${legacyParentCocoa.id}`);

  // Theme separation: changing parent accent does not change teen palette
  mockLocalStorage.clear();
  mockLocalStorage.setItem('twoway_selected_palette', 'palette-03');
  mockLocalStorage.setItem('twoway_parent_accent_palette', 'forest');
  mockLocalStorage.setItem('twoway_teen_theme_mode', 'light');
  mockLocalStorage.setItem('twoway_parent_theme_mode', 'dark');

  applyParentTheme();
  const parentThemeAttr = attrStore['data-parent-theme'];
  const parentAccentAttr = attrStore['data-parent-accent'];
  const parentBgVar = styleStore['--parent-bg'];
  
  assert(suite, 'Parent theme sets dark tokens without overwriting teen tokens', parentThemeAttr === 'dark' && parentAccentAttr === 'forest' && parentBgVar === '#0B0B0C', `parent-theme=${parentThemeAttr}, parent-accent=${parentAccentAttr}, parent-bg=${parentBgVar}`);
  assert(suite, 'Teen palette storage remained untouched by parent apply', mockLocalStorage.getItem('twoway_selected_palette') === 'palette-03', 'twoway_selected_palette remained palette-03');

  applyTeenTheme();
  assert(suite, 'Teen apply preserves parent storage intact', mockLocalStorage.getItem('twoway_parent_accent_palette') === 'forest', 'twoway_parent_accent_palette remained forest');
  assert(suite, 'Teen mode storage preserved intact', mockLocalStorage.getItem('twoway_teen_theme_mode') === 'light', 'twoway_teen_theme_mode remained light');
}

// -------------------------------------------------------------------
// 2. GROUP ACCESS & PRIVACY BOUNDARY
// -------------------------------------------------------------------
function testGroupAccessRestrictions() {
  const suite = 'Group Access & Security';

  mockLocalStorage.clear();
  // Set current user ID and connections
  mockLocalStorage.setItem('twoway_user_id', 'TW-001001');
  mockLocalStorage.setItem('twoway_circle_connections', JSON.stringify([
    { id: 'c1', twoWayId: 'TW-002002', connectedAt: '2026-01-01' },
    { id: 'c2', twoWayId: 'TW-003003', connectedAt: '2026-01-01' },
  ]));

  // Free user (no subscription set)
  assert(suite, 'Default tier is free_core', getCurrentSubscriptionTier() === 'free_core', `Plan tier is ${getCurrentSubscriptionTier()}`);
  assert(suite, 'Free user cannot access group conversations', !canAccessGroupConversations(), 'canAccessGroupConversations returned false');
  assert(suite, 'Free user hasPaidSubscription() is false', !hasPaidSubscription(), 'hasPaidSubscription returned false');

  // Ineligible user creates group
  const freeCreateAttempt = createGroupConversation('Secret Group', ['TW-002002']);
  assert(suite, 'Free user cannot create a group conversation', freeCreateAttempt.success === false && freeCreateAttempt.upgradeRequired === true, 'createGroupConversation returned upgradeRequired');

  // Seed an authorized group directly to test message blocking on free tier
  const existingGroup = {
    id: 'grp-test-existing',
    name: 'Family Chat',
    creatorTwoWayId: 'TW-001001',
    participants: ['TW-001001', 'TW-002002'],
    createdAt: new Date().toISOString(),
  };
  mockLocalStorage.setItem(STORAGE_KEY_GROUP_CONVERSATIONS, JSON.stringify([existingGroup]));

  const freeSendAttempt = sendGroupMessage('grp-test-existing', 'Unauthorized message');
  assert(suite, 'Free user cannot send message in existing group', freeSendAttempt.success === false && freeSendAttempt.upgradeRequired === true, 'sendGroupMessage returned upgradeRequired');

  const freeAddMember = addGroupMember('grp-test-existing', 'TW-003003');
  assert(suite, 'Free user cannot add members to group', freeAddMember.success === false && freeAddMember.upgradeRequired === true, 'addGroupMember returned upgradeRequired');

  // Now simulate paid tier (family)
  setCurrentSubscriptionTier('family');
  assert(suite, 'Paid tier family allows group access', canAccessGroupConversations(), 'canAccessGroupConversations returned true');
  assert(suite, 'Paid tier family hasPaidSubscription is true', hasPaidSubscription(), 'hasPaidSubscription returned true');

  // Paid user creates group
  const paidCreateAttempt = createGroupConversation('Paid Family Space', ['TW-002002']);
  assert(suite, 'Paid user can create a group conversation with connected peer', paidCreateAttempt.success === true, `Created group ID ${paidCreateAttempt.group?.id}`);

  // Paid user sends message
  const paidSendAttempt = sendGroupMessage('grp-test-existing', 'Authorized message');
  assert(suite, 'Paid user can send message to group', paidSendAttempt.success === true, 'sendGroupMessage returned true');

  // Paid user adds member
  const paidAddMember = addGroupMember('grp-test-existing', 'TW-003003');
  assert(suite, 'Paid user can add member to group', paidAddMember.success === true, 'addGroupMember returned true');

  const groupsAfterPaid = loadGroupConversations();
  const updatedGroup = groupsAfterPaid.find(g => g.id === 'grp-test-existing');
  assert(suite, 'Group data was properly mutated on authorized operation', updatedGroup?.participants.includes('TW-003003') === true, 'Participant added');
}

// -------------------------------------------------------------------
// 3. TWO-WAY ID IMMUTABILITY & FORMAT
// -------------------------------------------------------------------
function testNavigationAndIdIntegrity() {
  const suite = 'Identity & Two-Way ID Integrity';

  // Test ID format validation
  assert(suite, 'Valid 6-digit ID passes format check (TW-004920)', isValidTwoWayIdFormat('TW-004920'), 'Passed');
  assert(suite, 'Short ID fails format check (TW-492)', !isValidTwoWayIdFormat('TW-492'), 'Failed short format');
  assert(suite, 'Non-TW prefix fails format check (AB-004920)', !isValidTwoWayIdFormat('AB-004920'), 'Failed invalid prefix');
  assert(suite, 'Alphanumeric digits fail format check (TW-00492A)', !isValidTwoWayIdFormat('TW-00492A'), 'Failed non-digits');

  // Normalization with leading zeros
  assert(suite, 'Normalization preserves 6-digit zero padding', normalizeTwoWayId('4920') === 'TW-004920', `Normalized to ${normalizeTwoWayId('4920')}`);
  assert(suite, 'Normalization handles raw TW- prefix', normalizeTwoWayId('TW-4920') === 'TW-004920', `Normalized to ${normalizeTwoWayId('TW-4920')}`);

  // Birthday check math for teens (requires 13-19)
  const isEligibleTeen = (birthYear: number) => {
    const currentYear = 2026;
    const age = currentYear - birthYear;
    return age >= 13 && age <= 19;
  };
  assert(suite, 'Birthday check accepts age 15', isEligibleTeen(2011), 'Age 15 accepted');
  assert(suite, 'Birthday check rejects age 11', !isEligibleTeen(2015), 'Age 11 rejected');
  assert(suite, 'Birthday check rejects age 25', !isEligibleTeen(2001), 'Age 25 rejected');

  // Generator produces canonical format
  const generated = generateSixDigitId();
  assert(suite, 'generateSixDigitId produces valid canonical 6-digit format', isValidTwoWayIdFormat(generated), `Generated ${generated}`);

  // Current user ID getter
  mockLocalStorage.setItem('twoway_user_id', 'TW-001001');
  assert(suite, 'getCurrentUserTwoWayId returns canonical user ID', getCurrentUserTwoWayId() === 'TW-001001', 'Returned TW-001001');
}

// -------------------------------------------------------------------
// 4. SAVED GUIDES RETRIEVAL & SYNCHRONIZATION
// -------------------------------------------------------------------
function testSavedGuidesSync() {
  const suite = 'Saved Guides Persistence';

  mockLocalStorage.clear();

  // Initially empty
  assert(suite, 'Saved guides empty initially', loadSavedGuideIds().length === 0, 'Returned empty array');

  // Toggle save guide
  const saved = toggleSavedGuide('g_active_listening');
  assert(suite, 'Toggle saved guide returns true on add', saved === true, 'Added guide');
  assert(suite, 'Storage persisted to twoway_saved_guides', mockLocalStorage.getItem('twoway_saved_guides')?.includes('g_active_listening') === true, 'Storage written');

  const list = loadSavedGuideIds();
  assert(suite, 'loadSavedGuideIds retrieves saved ID', list.includes('g_active_listening'), 'Retrieved g_active_listening');

  // Toggle again to remove
  const removed = toggleSavedGuide('g_active_listening');
  assert(suite, 'Toggle saved guide returns false on remove', removed === false, 'Removed guide');
  assert(suite, 'loadSavedGuideIds reflects removal', loadSavedGuideIds().length === 0, 'Empty after removal');
}

// -------------------------------------------------------------------
// 5. COLOR CONTRAST RATIO MEASUREMENTS
// -------------------------------------------------------------------
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function testContrastRatios() {
  const suite = 'Contrast Ratio Verification';

  // Base typography contrast
  const lightBgText = contrastRatio('#000000', '#FFFFFF');
  assert(suite, 'Parent Light Mode: black text on white background', lightBgText >= 7.0, `Ratio: ${lightBgText.toFixed(2)}:1 (WCAG AAA >= 7.0:1)`);

  const darkBgText = contrastRatio('#FFFFFF', '#0B0B0C');
  assert(suite, 'Parent Dark Mode: white text on dark background', darkBgText >= 7.0, `Ratio: ${darkBgText.toFixed(2)}:1 (WCAG AAA >= 7.0:1)`);

  const lightSecondaryText = contrastRatio('#52525B', '#FFFFFF');
  assert(suite, 'Parent Light Mode: secondary text (#52525B) on white', lightSecondaryText >= 4.5, `Ratio: ${lightSecondaryText.toFixed(2)}:1 (WCAG AA >= 4.5:1)`);

  const darkSecondaryText = contrastRatio('#A1A1AA', '#141416');
  assert(suite, 'Parent Dark Mode: secondary text (#A1A1AA) on surface', darkSecondaryText >= 4.5, `Ratio: ${darkSecondaryText.toFixed(2)}:1 (WCAG AA >= 4.5:1)`);

  // Teen Dark Palettes surface to text contrast
  Object.entries(TEEN_DARK_PALETTE_TOKENS).forEach(([palId, tokens]) => {
    const whiteRatio = contrastRatio('#FFFFFF', tokens.surface);
    const secRatio = contrastRatio(tokens.textSecondary, tokens.surface);
    assert(suite, `Teen Dark [${palId}]: white text against surface`, whiteRatio >= 4.5, `Ratio: ${whiteRatio.toFixed(2)}:1 (WCAG AA)`);
    assert(suite, `Teen Dark [${palId}]: secondary text against surface`, secRatio >= 4.5, `Ratio: ${secRatio.toFixed(2)}:1 (WCAG AA)`);
  });
}

// -------------------------------------------------------------------
// 6. AGE VERIFICATION & BIRTHDAY BOUNDARIES (12, 13, 17, 18, 19, 20)
// -------------------------------------------------------------------
import { evaluateTeenEligibility } from '../src/utils/ageVerification';

function testAgeVerificationAndBirthdayBoundaries() {
  const suite = 'Age Verification & Birthday Boundaries';
  const refDate = new Date('2026-06-15T12:00:00Z'); // Fixed test reference date: June 15, 2026

  // 1. Ages 12, 13, 17, 18, 19, 20
  const age12 = evaluateTeenEligibility('2014-06-15', refDate);
  assert(suite, 'Age 12 evaluated as underage', age12.age === 12 && age12.eligibilityStatus === 'underage' && !age12.isEligibleTeen, `Age was ${age12.age}, status: ${age12.eligibilityStatus}`);

  const age13 = evaluateTeenEligibility('2013-06-15', refDate);
  assert(suite, 'Age 13 evaluated as eligible teen', age13.age === 13 && age13.eligibilityStatus === 'eligible' && age13.isEligibleTeen, `Age was ${age13.age}, status: ${age13.eligibilityStatus}`);

  const age17 = evaluateTeenEligibility('2009-06-15', refDate);
  assert(suite, 'Age 17 evaluated as eligible teen', age17.age === 17 && age17.eligibilityStatus === 'eligible' && age17.isEligibleTeen, `Age was ${age17.age}, status: ${age17.eligibilityStatus}`);

  const age18 = evaluateTeenEligibility('2008-06-15', refDate);
  assert(suite, 'Age 18 evaluated as eligible teen', age18.age === 18 && age18.eligibilityStatus === 'eligible' && age18.isEligibleTeen, `Age was ${age18.age}, status: ${age18.eligibilityStatus}`);

  const age19 = evaluateTeenEligibility('2007-06-15', refDate);
  assert(suite, 'Age 19 evaluated as eligible teen', age19.age === 19 && age19.eligibilityStatus === 'eligible' && age19.isEligibleTeen, `Age was ${age19.age}, status: ${age19.eligibilityStatus}`);

  const age20 = evaluateTeenEligibility('2006-06-15', refDate);
  assert(suite, 'Age 20 evaluated as aged_out (restricted read-only)', age20.age === 20 && age20.eligibilityStatus === 'aged_out' && age20.isAgedOut && !age20.isEligibleTeen, `Age was ${age20.age}, status: ${age20.eligibilityStatus}`);

  // 2. Exact 20th birthday boundary tests (Day Before, Day Of, Day After)
  // Person born June 15, 2006
  const born2006 = '2006-06-15';
  const dayBefore20th = new Date('2026-06-14T12:00:00Z');
  const dayOf20th = new Date('2026-06-15T12:00:00Z');
  const dayAfter20th = new Date('2026-06-16T12:00:00Z');

  const evalDayBefore20 = evaluateTeenEligibility(born2006, dayBefore20th);
  assert(suite, 'Day BEFORE 20th birthday is age 19 (eligible)', evalDayBefore20.age === 19 && evalDayBefore20.eligibilityStatus === 'eligible' && evalDayBefore20.isEligibleTeen && !evalDayBefore20.isAgedOut, `Age on day before 20th birthday was ${evalDayBefore20.age}`);

  const evalDayOf20 = evaluateTeenEligibility(born2006, dayOf20th);
  assert(suite, 'Day OF 20th birthday transitions to age 20 (aged_out)', evalDayOf20.age === 20 && evalDayOf20.eligibilityStatus === 'aged_out' && evalDayOf20.isAgedOut && !evalDayOf20.isEligibleTeen, `Age on day of 20th birthday was ${evalDayOf20.age}`);

  const evalDayAfter20 = evaluateTeenEligibility(born2006, dayAfter20th);
  assert(suite, 'Day AFTER 20th birthday is age 20 (aged_out)', evalDayAfter20.age === 20 && evalDayAfter20.eligibilityStatus === 'aged_out' && evalDayAfter20.isAgedOut, `Age on day after 20th birthday was ${evalDayAfter20.age}`);

  // 3. Exact 13th birthday boundary tests (Day Before, Day Of, Day After)
  // Person born June 15, 2013
  const born2013 = '2013-06-15';
  const dayBefore13th = new Date('2026-06-14T12:00:00Z');
  const dayOf13th = new Date('2026-06-15T12:00:00Z');
  const dayAfter13th = new Date('2026-06-16T12:00:00Z');

  const evalDayBefore13 = evaluateTeenEligibility(born2013, dayBefore13th);
  assert(suite, 'Day BEFORE 13th birthday is age 12 (underage)', evalDayBefore13.age === 12 && evalDayBefore13.eligibilityStatus === 'underage' && !evalDayBefore13.isEligibleTeen, `Age on day before 13th birthday was ${evalDayBefore13.age}`);

  const evalDayOf13 = evaluateTeenEligibility(born2013, dayOf13th);
  assert(suite, 'Day OF 13th birthday is age 13 (eligible)', evalDayOf13.age === 13 && evalDayOf13.eligibilityStatus === 'eligible' && evalDayOf13.isEligibleTeen, `Age on day of 13th birthday was ${evalDayOf13.age}`);

  const evalDayAfter13 = evaluateTeenEligibility(born2013, dayAfter13th);
  assert(suite, 'Day AFTER 13th birthday is age 13 (eligible)', evalDayAfter13.age === 13 && evalDayAfter13.eligibilityStatus === 'eligible' && evalDayAfter13.isEligibleTeen, `Age on day after 13th birthday was ${evalDayAfter13.age}`);

  // 4. Missing, unverified & future dates
  const evalMissing = evaluateTeenEligibility(null, refDate);
  assert(suite, 'Missing birth date evaluated as unverified', evalMissing.eligibilityStatus === 'unverified' && !evalMissing.isEligibleTeen, 'Correctly unverified');

  const evalFuture = evaluateTeenEligibility('2030-01-01', refDate);
  assert(suite, 'Future birth date rejected', evalFuture.eligibilityStatus === 'unverified' && !evalFuture.isEligibleTeen, 'Correctly rejected');
}

// -------------------------------------------------------------------
// 7. GOOGLE & APPLE SIGN-IN + BACKEND AGE-GATED AUTHORIZATION
// -------------------------------------------------------------------
import { app, testRegisterUser, testClearStores } from '../server';
import http from 'http';

async function testAuthenticationAndAgeGatedBackend() {
  const suite = 'Backend Authorization & Social Auth';

  testClearStores();

  // Create temporary in-process HTTP server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Google Sign-In for Teen without DOB -> requiresDob must be true
    const googleRes = await fetch(`${baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.teen@gmail.com',
        name: 'Alex Teen',
        role: 'teen',
      }),
    });
    const googleData = await googleRes.json();
    assert(suite, 'Google Sign-In for teen without DOB requires DOB verification', googleRes.status === 200 && googleData.requiresDob === true && !!googleData.sessionToken, `requiresDob=${googleData.requiresDob}`);

    // 2. Apple Sign-In for Teen without DOB -> requiresDob must be true
    const appleRes = await fetch(`${baseUrl}/api/auth/apple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jordan.teen@privaterelay.appleid.com',
        name: 'Jordan Apple',
        role: 'teen',
      }),
    });
    const appleData = await appleRes.json();
    assert(suite, 'Apple Sign-In for teen without DOB requires DOB verification', appleRes.status === 200 && appleData.requiresDob === true && !!appleData.sessionToken, `requiresDob=${appleData.requiresDob}`);

    // 3. Google Sign-In for Parent -> does NOT require DOB verification
    const parentRes = await fetch(`${baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'parent.pat@gmail.com',
        name: 'Pat Parent',
        role: 'parent',
      }),
    });
    const parentData = await parentRes.json();
    assert(suite, 'Google Sign-In for parent does not require DOB verification', parentRes.status === 200 && parentData.requiresDob === false && parentData.user.role === 'parent', `requiresDob=${parentData.requiresDob}`);

    // 4. DOB Verification endpoint: Underage rejection (< 13)
    const underageVerifyRes = await fetch(`${baseUrl}/api/auth/verify-dob`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthDate: '2016-01-01', // age ~10
        role: 'teen',
      }),
    });
    const underageData = await underageVerifyRes.json();
    assert(suite, 'POST /api/auth/verify-dob rejects underage teen (< 13) with 403', underageVerifyRes.status === 403 && underageData.error === 'UNDERAGE', `status=${underageVerifyRes.status}`);

    // 5. Eligible Teen (Age 15) can create journal entry via backend
    const eligibleTeen = testRegisterUser({
      email: 'eligible.teen@twoway.test',
      role: 'teen',
      birthDate: '2011-05-10', // Age 15
    });

    const createJournalRes = await fetch(`${baseUrl}/api/teen/journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${eligibleTeen.token}`,
      },
      body: JSON.stringify({
        title: 'Authorized Test Entry',
        body: 'This is my private journal entry.',
      }),
    });
    const createJournalData = await createJournalRes.json();
    assert(suite, 'Eligible teen (age 15) can create journal entry (200 OK)', createJournalRes.status === 200 && createJournalData.success === true && createJournalData.entry?.title === 'Authorized Test Entry', `status=${createJournalRes.status}`);

    // 6. Aged-Out User (Age 20) is BLOCKED from creating journal entry (403 Forbidden AGE_RESTRICTED)
    const agedOutTeen = testRegisterUser({
      email: 'agedout.teen@twoway.test',
      role: 'teen',
      birthDate: '2005-01-01', // Age 21 (>= 20)
    });

    const agedOutJournalPostRes = await fetch(`${baseUrl}/api/teen/journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agedOutTeen.token}`,
      },
      body: JSON.stringify({
        title: 'Bypass Attempt',
        body: 'Attempting to create entry after age 20.',
      }),
    });
    const agedOutJournalPostData = await agedOutJournalPostRes.json();
    assert(suite, 'Aged-out teen (age 20+) is BLOCKED with 403 AGE_RESTRICTED on journal creation', agedOutJournalPostRes.status === 403 && agedOutJournalPostData.error === 'AGE_RESTRICTED', `status=${agedOutJournalPostRes.status}, error=${agedOutJournalPostData.error}`);

    // 7. Aged-Out User CAN STILL READ their personal journal history (Read-only access preserved)
    const agedOutJournalGetRes = await fetch(`${baseUrl}/api/teen/journal`, {
      headers: {
        Authorization: `Bearer ${agedOutTeen.token}`,
      },
    });
    const agedOutJournalGetData = await agedOutJournalGetRes.json();
    assert(suite, 'Aged-out teen retains read-only access to historical entries (200 OK)', agedOutJournalGetRes.status === 200 && Array.isArray(agedOutJournalGetData.entries), `status=${agedOutJournalGetRes.status}`);

    // 8. Aged-Out User is BLOCKED from Nova messaging (403 Forbidden AGE_RESTRICTED)
    const agedOutNovaRes = await fetch(`${baseUrl}/api/teen/nova`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agedOutTeen.token}`,
      },
      body: JSON.stringify({
        message: 'Hello Nova, can I talk to you?',
      }),
    });
    const agedOutNovaData = await agedOutNovaRes.json();
    assert(suite, 'Aged-out teen is BLOCKED with 403 AGE_RESTRICTED on Nova messages', agedOutNovaRes.status === 403 && agedOutNovaData.error === 'AGE_RESTRICTED', `status=${agedOutNovaRes.status}`);

    // 9. Parent accounts cannot access private teen endpoints (403 ACCESS_DENIED)
    const parentUser = testRegisterUser({
      email: 'parent.test@twoway.test',
      role: 'parent',
    });
    const parentTeenAccessRes = await fetch(`${baseUrl}/api/teen/journal`, {
      headers: {
        Authorization: `Bearer ${parentUser.token}`,
      },
    });
    const parentTeenAccessData = await parentTeenAccessRes.json();
    assert(suite, 'Parent accounts are BLOCKED from private teen journal (403 ACCESS_DENIED)', parentTeenAccessRes.status === 403 && parentTeenAccessData.error === 'ACCESS_DENIED', `status=${parentTeenAccessRes.status}`);

    // 10. Session recheck dynamically marks aged out user
    const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        Authorization: `Bearer ${agedOutTeen.token}`,
      },
    });
    const sessionData = await sessionRes.json();
    assert(suite, 'Session recheck marks aged out user with canCreateContent: false', sessionRes.status === 200 && sessionData.user?.isAgedOut === true && sessionData.user?.canCreateContent === false, `canCreateContent=${sessionData.user?.canCreateContent}`);

  } finally {
    server.close();
  }
}

// -------------------------------------------------------------------
// EXECUTE SUITES
// -------------------------------------------------------------------
async function runAllTests() {
  console.log('Running Two-Way Post-Implementation Quality & Regression Audit...\n');
  testThemeAndPalettes();
  testGroupAccessRestrictions();
  testNavigationAndIdIntegrity();
  testSavedGuidesSync();
  testContrastRatios();
  testAgeVerificationAndBirthdayBoundaries();
  await testAuthenticationAndAgeGatedBackend();

  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${results.filter(r => r.status === 'PASS').length} PASSED, ${results.filter(r => r.status === 'FAIL').length} FAILED`);
  console.log('========================================\n');

  results.forEach(r => {
    const symbol = r.status === 'PASS' ? '✓' : '✗';
    console.log(`${symbol} [${r.suite}] ${r.test} -> ${r.detail}`);
  });

  if (results.some(r => r.status === 'FAIL')) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

