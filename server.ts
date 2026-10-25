import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateTeenEligibility } from './src/utils/ageVerification';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// ===================================================================
// IN-MEMORY USER & SESSION STORE
// ===================================================================
export interface ServerUser {
  id: string;
  email: string;
  role: 'teen' | 'parent';
  provider: 'email' | 'google' | 'apple';
  providerId?: string;
  name?: string;
  birthDate?: string; // YYYY-MM-DD
  twoWayId: string;
  createdAt: string;
}

export interface ServerSession {
  token: string;
  userId: string;
  createdAt: number;
  lastActive: number;
}

// In-memory data store for server-side persistence
const usersStore: Map<string, ServerUser> = new Map(); // key: userId
const usersByEmail: Map<string, string> = new Map();  // email -> userId
const sessionsStore: Map<string, ServerSession> = new Map(); // token -> session

// Protected storage for teen content
const journalStore: Map<string, Array<{ id: string; title?: string; body: string; createdAt: string }>> = new Map();
const thoughtsStore: Map<string, Array<{ id: string; content: string; createdAt: string }>> = new Map();

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateTwoWayId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `TW-${num}`;
}

// Helper: resolve session from request
export function resolveUserSession(req: Request): { user: ServerUser; session: ServerSession } | null {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.twoway_session) {
    token = req.cookies.twoway_session;
  }

  if (!token) return null;

  const session = sessionsStore.get(token);
  if (!session) return null;

  const user = usersStore.get(session.userId);
  if (!user) return null;

  session.lastActive = Date.now();
  return { user, session };
}

// ===================================================================
// AUTHENTICATION API ENDPOINTS
// ===================================================================

/**
 * POST /api/auth/google
 * Google Sign-In with server-side validation & age verification requirement.
 */
app.post('/api/auth/google', (req: Request, res: Response) => {
  const { email, name, providerId, role, birthDate } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'A valid email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUserId = usersByEmail.get(normalizedEmail);
  let user: ServerUser;

  if (existingUserId && usersStore.has(existingUserId)) {
    user = usersStore.get(existingUserId)!;
  } else {
    const targetRole = role === 'parent' ? 'parent' : 'teen';
    user = {
      id: generateId('usr'),
      email: normalizedEmail,
      role: targetRole,
      provider: 'google',
      providerId: providerId || generateId('goog'),
      name: name || 'Google User',
      twoWayId: generateTwoWayId(),
      createdAt: new Date().toISOString(),
    };
    usersStore.set(user.id, user);
    usersByEmail.set(normalizedEmail, user.id);
  }

  // Update birth date if provided in payload
  if (birthDate && typeof birthDate === 'string') {
    user.birthDate = birthDate;
  }

  // For teens, check whether DOB is verified
  const requiresDob = user.role === 'teen' && !user.birthDate;

  let eligibility = null;
  if (user.role === 'teen' && user.birthDate) {
    eligibility = evaluateTeenEligibility(user.birthDate);
    if (eligibility.eligibilityStatus === 'underage') {
      return res.status(403).json({
        error: 'UNDERAGE',
        message: 'Two-Way is available for teens aged 13–19.',
        eligibility,
      });
    }
  }

  // Generate session
  const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  sessionsStore.set(token, {
    token,
    userId: user.id,
    createdAt: Date.now(),
    lastActive: Date.now(),
  });

  res.cookie('twoway_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      twoWayId: user.twoWayId,
      birthDate: user.birthDate,
      provider: 'google',
    },
    sessionToken: token,
    requiresDob,
    eligibility,
  });
});

/**
 * POST /api/auth/apple
 * Apple Sign-In with server-side validation & age verification requirement.
 */
app.post('/api/auth/apple', (req: Request, res: Response) => {
  const { email, name, providerId, role, birthDate } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'A valid email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUserId = usersByEmail.get(normalizedEmail);
  let user: ServerUser;

  if (existingUserId && usersStore.has(existingUserId)) {
    user = usersStore.get(existingUserId)!;
  } else {
    const targetRole = role === 'parent' ? 'parent' : 'teen';
    user = {
      id: generateId('usr'),
      email: normalizedEmail,
      role: targetRole,
      provider: 'apple',
      providerId: providerId || generateId('apple'),
      name: name || 'Apple User',
      twoWayId: generateTwoWayId(),
      createdAt: new Date().toISOString(),
    };
    usersStore.set(user.id, user);
    usersByEmail.set(normalizedEmail, user.id);
  }

  // Apple tokens notoriously do NOT provide date of birth
  if (birthDate && typeof birthDate === 'string') {
    user.birthDate = birthDate;
  }

  const requiresDob = user.role === 'teen' && !user.birthDate;

  let eligibility = null;
  if (user.role === 'teen' && user.birthDate) {
    eligibility = evaluateTeenEligibility(user.birthDate);
    if (eligibility.eligibilityStatus === 'underage') {
      return res.status(403).json({
        error: 'UNDERAGE',
        message: 'Two-Way is available for teens aged 13–19.',
        eligibility,
      });
    }
  }

  const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  sessionsStore.set(token, {
    token,
    userId: user.id,
    createdAt: Date.now(),
    lastActive: Date.now(),
  });

  res.cookie('twoway_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      twoWayId: user.twoWayId,
      birthDate: user.birthDate,
      provider: 'apple',
    },
    sessionToken: token,
    requiresDob,
    eligibility,
  });
});

/**
 * POST /api/auth/verify-dob
 * Explicit server-side age verification for teen access.
 */
app.post('/api/auth/verify-dob', (req: Request, res: Response) => {
  const { birthDate, email, role } = req.body;

  if (!birthDate || typeof birthDate !== 'string') {
    return res.status(400).json({ error: 'MISSING_DOB', message: 'Date of birth is required.' });
  }

  // Calculate age using server's current date
  const eligibility = evaluateTeenEligibility(birthDate, new Date());

  if (eligibility.eligibilityStatus === 'underage') {
    return res.status(403).json({
      error: 'UNDERAGE',
      message: 'Two-Way is available for teens aged 13–19.',
      eligibility,
    });
  }

  // Look up session or user by email
  const resolved = resolveUserSession(req);
  let user: ServerUser | undefined;

  if (resolved) {
    user = resolved.user;
  } else if (email && typeof email === 'string') {
    const userId = usersByEmail.get(email.trim().toLowerCase());
    if (userId) user = usersStore.get(userId);
  }

  if (!user && email) {
    // Register temporary user record if in middle of multi-step signup
    const normalizedEmail = email.trim().toLowerCase();
    user = {
      id: generateId('usr'),
      email: normalizedEmail,
      role: (role === 'parent' ? 'parent' : 'teen'),
      provider: 'email',
      twoWayId: generateTwoWayId(),
      createdAt: new Date().toISOString(),
    };
    usersStore.set(user.id, user);
    usersByEmail.set(normalizedEmail, user.id);
  }

  if (user) {
    user.birthDate = birthDate;
  }

  return res.json({
    success: true,
    birthDate,
    age: eligibility.age,
    eligibilityStatus: eligibility.eligibilityStatus,
    isEligibleTeen: eligibility.isEligibleTeen,
    isAgedOut: eligibility.isAgedOut,
    message: eligibility.message,
  });
});

/**
 * GET /api/auth/session
 * Re-validates the session and computes the dynamic age status as of right now.
 */
app.get('/api/auth/session', (req: Request, res: Response) => {
  const resolved = resolveUserSession(req);
  if (!resolved) {
    return res.json({ authenticated: false });
  }

  const { user } = resolved;
  let eligibility = null;
  let canCreateContent = true;

  if (user.role === 'teen') {
    if (!user.birthDate) {
      canCreateContent = false;
      eligibility = {
        birthDate: '',
        age: -1,
        eligibilityStatus: 'unverified',
        isEligibleTeen: false,
        isAgedOut: false,
        message: 'Date of birth not verified.',
      };
    } else {
      eligibility = evaluateTeenEligibility(user.birthDate, new Date());
      // If aged out (age >= 20) or underage, canCreateContent is FALSE
      canCreateContent = eligibility.isEligibleTeen;
    }
  }

  return res.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      twoWayId: user.twoWayId,
      birthDate: user.birthDate,
      provider: user.provider,
      age: eligibility?.age,
      eligibilityStatus: eligibility?.eligibilityStatus || 'eligible',
      isAgedOut: eligibility?.isAgedOut || false,
      canCreateContent,
      message: eligibility?.message,
    },
  });
});

/**
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const resolved = resolveUserSession(req);
  if (resolved) {
    sessionsStore.delete(resolved.session.token);
  }
  res.clearCookie('twoway_session');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ===================================================================
// AGE-GATED TEEN BACKEND AUTHORIZATION MIDDLEWARE
// ===================================================================
export function requireEligibleTeen(req: Request, res: Response, next: NextFunction) {
  const resolved = resolveUserSession(req);
  if (!resolved) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
  }

  const { user } = resolved;
  if (user.role !== 'teen') {
    return res.status(403).json({ error: 'ACCESS_DENIED', message: 'This feature is only for teen accounts.' });
  }

  if (!user.birthDate) {
    return res.status(403).json({
      error: 'UNVERIFIED_AGE',
      code: 'DOB_REQUIRED',
      message: 'A verified date of birth is required to access teen features.',
    });
  }

  const eligibility = evaluateTeenEligibility(user.birthDate, new Date());

  if (eligibility.eligibilityStatus === 'underage') {
    return res.status(403).json({
      error: 'UNDERAGE',
      message: 'Two-Way is available for teens aged 13–19.',
    });
  }

  if (eligibility.eligibilityStatus === 'aged_out' || eligibility.isAgedOut) {
    return res.status(403).json({
      error: 'AGE_RESTRICTED',
      code: 'TEEN_AGED_OUT',
      age: eligibility.age,
      message: 'At age 20, teen accounts transition to a restricted read-only state. Creating new content is disabled.',
      readOnly: true,
    });
  }

  next();
}

// Protected Teen Endpoints
app.post('/api/teen/journal', requireEligibleTeen, (req: Request, res: Response) => {
  const resolved = resolveUserSession(req)!;
  const { title, body } = req.body;

  if (!body || typeof body !== 'string' || !body.trim()) {
    return res.status(400).json({ error: 'EMPTY_BODY', message: 'Journal entry body cannot be empty.' });
  }

  const userEntries = journalStore.get(resolved.user.id) || [];
  const entry = {
    id: generateId('jrn'),
    title: title ? String(title).trim() : undefined,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };

  userEntries.unshift(entry);
  journalStore.set(resolved.user.id, userEntries);

  return res.json({ success: true, entry });
});

app.get('/api/teen/journal', (req: Request, res: Response) => {
  const resolved = resolveUserSession(req);
  if (!resolved) return res.status(401).json({ error: 'UNAUTHORIZED' });
  if (resolved.user.role !== 'teen') return res.status(403).json({ error: 'ACCESS_DENIED' });

  // Read-only access to existing history is ALWAYS preserved for aged-out users!
  const userEntries = journalStore.get(resolved.user.id) || [];
  return res.json({ success: true, entries: userEntries });
});

app.post('/api/teen/nova', requireEligibleTeen, (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'EMPTY_MESSAGE', message: 'Message cannot be empty.' });
  }

  return res.json({
    success: true,
    reply: "I hear you. What feels like the hardest part of this situation right now?",
    timestamp: Date.now(),
  });
});

app.post('/api/teen/thoughts', requireEligibleTeen, (req: Request, res: Response) => {
  const resolved = resolveUserSession(req)!;
  const { content } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'EMPTY_CONTENT', message: 'Thought content cannot be empty.' });
  }

  const userThoughts = thoughtsStore.get(resolved.user.id) || [];
  const thought = {
    id: generateId('tht'),
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  userThoughts.unshift(thought);
  thoughtsStore.set(resolved.user.id, userThoughts);

  return res.json({ success: true, thought });
});

// Helper for tests to register an account directly
export function testRegisterUser(user: Partial<ServerUser> & { email: string; role: 'teen' | 'parent' }): { user: ServerUser; token: string } {
  const fullUser: ServerUser = {
    id: user.id || generateId('usr'),
    email: user.email.toLowerCase(),
    role: user.role,
    provider: user.provider || 'email',
    birthDate: user.birthDate,
    twoWayId: user.twoWayId || generateTwoWayId(),
    createdAt: new Date().toISOString(),
    name: user.name || 'Test User',
  };
  usersStore.set(fullUser.id, fullUser);
  usersByEmail.set(fullUser.email, fullUser.id);

  const token = `sess_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  sessionsStore.set(token, {
    token,
    userId: fullUser.id,
    createdAt: Date.now(),
    lastActive: Date.now(),
  });

  return { user: fullUser, token };
}

export function testClearStores() {
  usersStore.clear();
  usersByEmail.clear();
  sessionsStore.clear();
  journalStore.clear();
  thoughtsStore.clear();
}

// ===================================================================
// VITE DEV SERVER / STATIC ASSETS
// ===================================================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Two-Way server running on http://0.0.0.0:${PORT}`);
  });
}

// Only start the listening server when executed directly as main script
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export { app };
