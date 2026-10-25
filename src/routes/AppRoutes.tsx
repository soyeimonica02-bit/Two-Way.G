import { Navigate, Route, Routes } from 'react-router-dom';
import Nova from '../pages/Nova';

import Landing from '../pages/Landing';
import RoleSelection from '../pages/RoleSelection';
import BirthdayCheck from '../pages/BirthdayCheck';
import Auth from '../pages/Auth';
import VerifyEmail from '../pages/VerifyEmail';
import Onboarding from '../pages/Onboarding';

import TeenDashboard from '../pages/TeenDashboard';
import ParentDashboard from '../pages/ParentDashboard';
import Perspective from '../pages/Perspective';
import EmotionalCalendar from '../pages/EmotionalCalendar';
import MoodReflection from '../pages/MoodReflection';

import MyHaven from '../pages/MyHaven';
import HavenJournal from '../pages/HavenJournal';
import HavenThoughts from '../pages/HavenThoughts';
import MyCircle from '../pages/MyCircle';
import AddConnectionId from '../pages/AddConnectionId';

import Conversations from '../pages/Conversations';
import ConversationView from '../pages/ConversationView';
import GroupConversationView from '../pages/GroupConversationView';

import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import SettingsEmail from '../pages/SettingsEmail';
import SettingsPrivacy from '../pages/SettingsPrivacy';
import SettingsHaven from '../pages/SettingsHaven';
import SettingsNotifications from '../pages/SettingsNotifications';
import SettingsAppearance from '../pages/SettingsAppearance';
import SettingsHelp from '../pages/SettingsHelp';
import SettingsAbout from '../pages/SettingsAbout';

import { evaluateTeenEligibility } from '../utils/ageVerification';

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

  // Age Gate protection for Teen experience
  if (requiredRole === 'teen') {
    const registeredDob =
      localStorage.getItem('twoway_registered_dob') ||
      localStorage.getItem('twoway_signup_dob');

    // Missing or unverified DOB: must verify before granting teen access
    if (!registeredDob) {
      return <Navigate to="/auth/birthday?returnTo=/app/teen" replace />;
    }

    const eligibility = evaluateTeenEligibility(registeredDob);
    if (eligibility.eligibilityStatus === 'underage') {
      // Under 13 must never access teen experience
      return <Navigate to="/roles" replace />;
    }
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
          TEEN EXPERIENCE (PROTECTED)
      ========================================= */}

      <Route
        path="/app/teen"
        element={
          <RoleGuard requiredRole="teen">
            <TeenDashboard />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/nova"
        element={
          <RoleGuard requiredRole="teen">
            <Nova />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/emotional-calendar"
        element={
          <RoleGuard requiredRole="teen">
            <EmotionalCalendar />
          </RoleGuard>
        }
      />

      <Route
        path="/emotional-calendar"
        element={<Navigate to="/app/teen/emotional-calendar" replace />}
      />

      <Route
        path="/app/teen/mood-reflection"
        element={
          <RoleGuard requiredRole="teen">
            <MoodReflection />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/mood-history"
        element={<Navigate to="/app/teen/mood-reflection" replace />}
      />

      {/* My Haven - Strictly Teen Only */}
      <Route
        path="/app/teen/haven"
        element={
          <RoleGuard requiredRole="teen">
            <MyHaven />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/haven/journal"
        element={
          <RoleGuard requiredRole="teen">
            <HavenJournal />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/haven/thoughts"
        element={
          <RoleGuard requiredRole="teen">
            <HavenThoughts />
          </RoleGuard>
        }
      />

      {/* Teen My Circle */}
      <Route
        path="/app/teen/circle"
        element={
          <RoleGuard requiredRole="teen">
            <MyCircle />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/circle/add"
        element={
          <RoleGuard requiredRole="teen">
            <AddConnectionId />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/circle/add-id"
        element={
          <RoleGuard requiredRole="teen">
            <AddConnectionId />
          </RoleGuard>
        }
      />

      {/* Teen Clarity / Conversations */}
      <Route
        path="/app/teen/conversations"
        element={
          <RoleGuard requiredRole="teen">
            <Conversations />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/clarity"
        element={
          <RoleGuard requiredRole="teen">
            <Conversations />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/conversations/:conversationId"
        element={
          <RoleGuard requiredRole="teen">
            <ConversationView />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/clarity/:conversationId"
        element={
          <RoleGuard requiredRole="teen">
            <ConversationView />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/groups/:groupId"
        element={
          <RoleGuard requiredRole="teen">
            <GroupConversationView />
          </RoleGuard>
        }
      />

      {/* Teen Profile & Settings */}
      <Route
        path="/app/teen/profile"
        element={
          <RoleGuard requiredRole="teen">
            <Profile />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/settings"
        element={
          <RoleGuard requiredRole="teen">
            <Settings />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/settings/profile"
        element={<Navigate to="/app/teen/profile" replace />}
      />

      <Route
        path="/app/teen/settings/email"
        element={
          <RoleGuard requiredRole="teen">
            <SettingsEmail />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/settings/privacy"
        element={
          <RoleGuard requiredRole="teen">
            <SettingsPrivacy />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/settings/haven"
        element={
          <RoleGuard requiredRole="teen">
            <SettingsHaven />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/settings/notifications"
        element={
          <RoleGuard requiredRole="teen">
            <SettingsNotifications />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/settings/appearance"
        element={
          <RoleGuard requiredRole="teen">
            <SettingsAppearance />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/settings/help"
        element={
          <RoleGuard requiredRole="teen">
            <SettingsHelp />
          </RoleGuard>
        }
      />

      <Route
        path="/app/teen/settings/about"
        element={
          <RoleGuard requiredRole="teen">
            <SettingsAbout />
          </RoleGuard>
        }
      />


      {/* =========================================
          PARENT EXPERIENCE (PROTECTED)
      ========================================= */}

      <Route
        path="/app/parent"
        element={
          <RoleGuard requiredRole="parent">
            <ParentDashboard />
          </RoleGuard>
        }
      />

      {/* Perspective - Parent Only Feature */}
      <Route
        path="/app/parent/perspective"
        element={
          <RoleGuard requiredRole="parent">
            <Perspective />
          </RoleGuard>
        }
      />

      {/* Parents do not have Clarity - redirect to Parent Perspective or Dashboard */}
      <Route
        path="/app/parent/conversations"
        element={<Navigate to="/app/parent/circle" replace />}
      />

      <Route
        path="/app/parent/clarity"
        element={<Navigate to="/app/parent/perspective" replace />}
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

      <Route
        path="/app/parent/groups/:groupId"
        element={
          <RoleGuard requiredRole="parent">
            <GroupConversationView />
          </RoleGuard>
        }
      />

      {/* Parent My Circle */}
      <Route
        path="/app/parent/circle"
        element={
          <RoleGuard requiredRole="parent">
            <MyCircle />
          </RoleGuard>
        }
      />

      <Route
        path="/app/parent/circle/add"
        element={
          <RoleGuard requiredRole="parent">
            <AddConnectionId />
          </RoleGuard>
        }
      />

      <Route
        path="/app/parent/circle/add-id"
        element={
          <RoleGuard requiredRole="parent">
            <AddConnectionId />
          </RoleGuard>
        }
      />

      {/* Parent Nova */}
      <Route
        path="/app/parent/nova"
        element={
          <RoleGuard requiredRole="parent">
            <Nova />
          </RoleGuard>
        }
      />

      {/* Parent Profile */}
      <Route
        path="/app/parent/profile"
        element={
          <RoleGuard requiredRole="parent">
            <Profile />
          </RoleGuard>
        }
      />

      {/* Parent Settings & Subpages */}
      <Route
        path="/app/parent/settings"
        element={
          <RoleGuard requiredRole="parent">
            <Settings />
          </RoleGuard>
        }
      />

      <Route
        path="/app/parent/settings/profile"
        element={<Navigate to="/app/parent/profile" replace />}
      />

      <Route
        path="/app/parent/settings/email"
        element={
          <RoleGuard requiredRole="parent">
            <SettingsEmail />
          </RoleGuard>
        }
      />

      <Route
        path="/app/parent/settings/privacy"
        element={
          <RoleGuard requiredRole="parent">
            <SettingsPrivacy />
          </RoleGuard>
        }
      />

      {/* Parents cannot access Haven settings */}
      <Route
        path="/app/parent/settings/haven"
        element={<Navigate to="/app/parent/settings" replace />}
      />

      <Route
        path="/app/parent/settings/notifications"
        element={
          <RoleGuard requiredRole="parent">
            <SettingsNotifications />
          </RoleGuard>
        }
      />

      <Route
        path="/app/parent/settings/appearance"
        element={
          <RoleGuard requiredRole="parent">
            <SettingsAppearance />
          </RoleGuard>
        }
      />

      <Route
        path="/app/parent/settings/help"
        element={
          <RoleGuard requiredRole="parent">
            <SettingsHelp />
          </RoleGuard>
        }
      />

      <Route
        path="/app/parent/settings/about"
        element={
          <RoleGuard requiredRole="parent">
            <SettingsAbout />
          </RoleGuard>
        }
      />


      {/* =========================================
          OTHER UNSUPPORTED ROLES (REDIRECT TO ROLES)
      ========================================= */}

      <Route
        path="/app/sibling"
        element={<Navigate to="/roles" replace />}
      />

      <Route
        path="/app/partner"
        element={<Navigate to="/roles" replace />}
      />

      <Route
        path="/app/spouse"
        element={<Navigate to="/roles" replace />}
      />

      <Route
        path="/app/counselor"
        element={<Navigate to="/roles" replace />}
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