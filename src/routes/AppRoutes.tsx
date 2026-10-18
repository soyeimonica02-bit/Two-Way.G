import { Navigate, Route, Routes } from 'react-router-dom';

import Landing from '../pages/Landing';
import RoleSelection from '../pages/RoleSelection';
import BirthdayCheck from '../pages/BirthdayCheck';
import Auth from '../pages/Auth';
import VerifyEmail from '../pages/VerifyEmail';
import Onboarding from '../pages/Onboarding';

import TeenDashboard from '../pages/TeenDashboard';
import ParentDashboard from '../pages/ParentDashboard';
import SiblingDashboard from '../pages/SiblingDashboard';
import PartnerDashboard from '../pages/PartnerDashboard';
import SpouseDashboard from '../pages/SpouseDashboard';
import CounselorDashboard from '../pages/CounselorDashboard';
import Nova from '../pages/Nova';
import EmotionalCalendar from '../pages/EmotionalCalendar';
import MoodReflection from '../pages/MoodReflection';

import MyHaven from '../pages/MyHaven';
import HavenJournal from '../pages/HavenJournal';
import HavenThoughts from '../pages/HavenThoughts';
import MyCircle from '../pages/MyCircle';
import AddConnectionId from '../pages/AddConnectionId';

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

function RoleGuard({
  requiredRole,
  children,
}: {
  requiredRole: string;
  children: React.ReactElement;
}) {
  const registeredRole =
    localStorage.getItem('twoway_registered_role') ||
    localStorage.getItem('twoway_selected_role');
  if (registeredRole && registeredRole !== requiredRole) {
    return <Navigate to={`/app/${registeredRole}`} replace />;
  }
  return children;
}

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
        element={
          <RoleGuard requiredRole="teen">
            <MyHaven />
          </RoleGuard>
        }
      />

      {/* My Haven Journal */}
      <Route
        path="/app/teen/haven/journal"
        element={
          <RoleGuard requiredRole="teen">
            <HavenJournal />
          </RoleGuard>
        }
      />

      {/* Haven thoughts route */}
      <Route
        path="/app/teen/haven/thoughts"
        element={
          <RoleGuard requiredRole="teen">
            <HavenThoughts />
          </RoleGuard>
        }
      />


      {/* =========================================
          MY CIRCLE
      ========================================= */}

      <Route
        path="/app/teen/circle"
        element={<MyCircle />}
      />

      <Route
        path="/app/teen/circle/add"
        element={<AddConnectionId />}
      />

      <Route
        path="/app/teen/circle/add-id"
        element={<AddConnectionId />}
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
          PARENT HOME
      ========================================= */}

      <Route
        path="/app/parent"
        element={
          <RoleGuard requiredRole="parent">
            <ParentDashboard />
          </RoleGuard>
        }
      />

      {/* Parents do not have Clarity - redirect to Parent Dashboard */}
      <Route
        path="/app/parent/conversations"
        element={<Navigate to="/app/parent" replace />}
      />

      <Route
        path="/app/parent/clarity"
        element={<Navigate to="/app/parent" replace />}
      />

      <Route
        path="/app/parent/conversations/:conversationId"
        element={
          <RoleGuard requiredRole="parent">
            <ConversationView />
          </RoleGuard>
        }
      />

      <Route
        path="/app/parent/clarity/:conversationId"
        element={
          <RoleGuard requiredRole="parent">
            <ConversationView />
          </RoleGuard>
        }
      />

      {/* Parent My Circle */}
      <Route
        path="/app/parent/circle"
        element={<MyCircle />}
      />

      <Route
        path="/app/parent/circle/add"
        element={<AddConnectionId />}
      />

      <Route
        path="/app/parent/circle/add-id"
        element={<AddConnectionId />}
      />

      {/* Parent Nova */}
      <Route
        path="/app/parent/nova"
        element={<Nova />}
      />

      {/* Parent Profile */}
      <Route
        path="/app/parent/profile"
        element={<Profile />}
      />

      {/* Parent Settings & Subpages */}
      <Route
        path="/app/parent/settings"
        element={<Settings />}
      />

      <Route
        path="/app/parent/settings/profile"
        element={<Navigate to="/app/parent/profile" replace />}
      />

      <Route
        path="/app/parent/settings/email"
        element={<SettingsEmail />}
      />

      <Route
        path="/app/parent/settings/privacy"
        element={<SettingsPrivacy />}
      />

      <Route
        path="/app/parent/settings/haven"
        element={<Navigate to="/app/parent/settings" replace />}
      />

      <Route
        path="/app/parent/settings/notifications"
        element={<SettingsNotifications />}
      />

      <Route
        path="/app/parent/settings/appearance"
        element={<SettingsAppearance />}
      />

      <Route
        path="/app/parent/settings/help"
        element={<SettingsHelp />}
      />

      <Route
        path="/app/parent/settings/about"
        element={<SettingsAbout />}
      />


      {/* =========================================
          OTHER SUPPORTED ROLES
      ========================================= */}

      <Route
        path="/app/sibling"
        element={<SiblingDashboard />}
      />

      <Route
        path="/app/partner"
        element={<PartnerDashboard />}
      />

      <Route
        path="/app/spouse"
        element={<SpouseDashboard />}
      />

      <Route
        path="/app/counselor"
        element={<CounselorDashboard />}
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