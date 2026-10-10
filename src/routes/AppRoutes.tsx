import { Navigate, Route, Routes } from 'react-router-dom';

import Landing from '../pages/Landing';
import RoleSelection from '../pages/RoleSelection';
import BirthdayCheck from '../pages/BirthdayCheck';
import Auth from '../pages/Auth';
import VerifyEmail from '../pages/VerifyEmail';
import Onboarding from '../pages/Onboarding';

import TeenDashboard from '../pages/TeenDashboard';
import Nova from '../pages/Nova';
import EmotionalCalendar from '../pages/EmotionalCalendar';
import MoodReflection from '../pages/MoodReflection';

import MyHaven from '../pages/MyHaven';
import HavenJournal from '../pages/HavenJournal';
import HavenThoughts from '../pages/HavenThoughts';
import MyCircle from '../pages/MyCircle';

import Conversations from '../pages/Conversations';
import ConversationView from '../pages/ConversationView';

import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import SettingsEmail from '../pages/SettingsEmail';
import SettingsPrivacy from '../pages/SettingsPrivacy';
import SettingsHaven from '../pages/SettingsHaven';
import SettingsNotifications from '../pages/SettingsNotifications';
import SettingsAppearance from '../pages/SettingsAppearance';
import SettingsHelp from '../pages/SettingsHelp';
import SettingsAbout from '../pages/SettingsAbout';

export default function AppRoutes() {
  return (
    <Routes>

      {/* =========================================
          PUBLIC
      ========================================= */}

      <Route
        path="/"
        element={<Landing />}
      />


      {/* =========================================
          ROLE SELECTION
      ========================================= */}

      <Route
        path="/roles"
        element={<RoleSelection />}
      />

      <Route
        path="/auth/role-selection"
        element={<RoleSelection />}
      />


      {/* =========================================
          AUTHENTICATION
      ========================================= */}

      <Route
        path="/auth"
        element={<Auth />}
      />

      <Route
        path="/auth/login"
        element={<Auth />}
      />

      <Route
        path="/auth/birthday"
        element={<BirthdayCheck />}
      />

      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />


      {/* =========================================
          ONBOARDING
      ========================================= */}

      <Route
        path="/onboarding"
        element={<Onboarding />}
      />


      {/* =========================================
          TEEN HOME
      ========================================= */}

      <Route
        path="/app/teen"
        element={<TeenDashboard />}
      />


      {/* =========================================
          NOVA
      ========================================= */}

      <Route
        path="/app/teen/nova"
        element={<Nova />}
      />


      {/* =========================================
          EMOTIONAL CALENDAR
      ========================================= */}

      <Route
        path="/app/teen/emotional-calendar"
        element={<EmotionalCalendar />}
      />

      {/* Legacy URL */}
      <Route
        path="/emotional-calendar"
        element={<EmotionalCalendar />}
      />


      {/* =========================================
          MOOD REFLECTION
      ========================================= */}

      <Route
        path="/app/teen/mood-reflection"
        element={<MoodReflection />}
      />

      {/* Legacy mood history redirect */}
      <Route
        path="/app/teen/mood-history"
        element={
          <Navigate
            to="/app/teen/mood-reflection"
            replace
          />
        }
      />


      {/* =========================================
          MY HAVEN
      ========================================= */}

      <Route
        path="/app/teen/haven"
        element={<MyHaven />}
      />

      {/* My Haven Journal */}
      <Route
        path="/app/teen/haven/journal"
        element={<HavenJournal />}
      />

      {/* Haven thoughts route */}
      <Route
        path="/app/teen/haven/thoughts"
        element={<HavenThoughts />}
      />


      {/* =========================================
          MY CIRCLE
      ========================================= */}

      <Route
        path="/app/teen/circle"
        element={<MyCircle />}
      />


      {/* =========================================
          CLARITY / CONVERSATIONS
      ========================================= */}

      <Route
        path="/app/teen/conversations"
        element={<Conversations />}
      />

      <Route
        path="/app/teen/clarity"
        element={<Conversations />}
      />

      {/* Single conversation route */}
      <Route
        path="/app/teen/conversations/:conversationId"
        element={<ConversationView />}
      />

      <Route
        path="/app/teen/clarity/:conversationId"
        element={<ConversationView />}
      />


      {/* =========================================
          PROFILE
      ========================================= */}

      <Route
        path="/app/teen/profile"
        element={<Profile />}
      />


      {/* =========================================
          SETTINGS & SUBPAGES
      ========================================= */}

      <Route
        path="/app/teen/settings"
        element={<Settings />}
      />

      <Route
        path="/app/teen/settings/profile"
        element={<Navigate to="/app/teen/profile" replace />}
      />

      <Route
        path="/app/teen/settings/email"
        element={<SettingsEmail />}
      />

      <Route
        path="/app/teen/settings/privacy"
        element={<SettingsPrivacy />}
      />

      <Route
        path="/app/teen/settings/haven"
        element={<SettingsHaven />}
      />

      <Route
        path="/app/teen/settings/notifications"
        element={<SettingsNotifications />}
      />

      <Route
        path="/app/teen/settings/appearance"
        element={<SettingsAppearance />}
      />

      <Route
        path="/app/teen/settings/help"
        element={<SettingsHelp />}
      />

      <Route
        path="/app/teen/settings/about"
        element={<SettingsAbout />}
      />


      {/* =========================================
          FALLBACK
      ========================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}