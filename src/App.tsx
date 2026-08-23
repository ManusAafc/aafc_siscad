import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { PasswordRecovery } from './pages/auth/PasswordRecovery';
import { PasswordNew } from './pages/auth/PasswordNew';
import { Dashboard } from './pages/dashboard/Dashboard';
import { MembersSearch } from './pages/members/MembersSearch';
import { MemberShow } from './pages/members/MemberShow';
import { MemberCU } from './pages/members/MemberCU';
import { MeetingsSearch } from './pages/meetings/MeetingsSearch';
import { MeetingShow } from './pages/meetings/MeetingShow';
import { MeetingCU } from './pages/meetings/MeetingCU';
import { MeetingMemberAdd } from './pages/meetings/MeetingMemberAdd';
import { SettingsPage } from './pages/settings/SettingsPage';
import { Layout } from './components/layout/Layout';
import { LoadingBar } from './components/common/LoadingBar';
import { SplashScreen } from './components/splash/SplashScreen';
import { ToastContainer } from './components/common/Toast';
import { AlertDialog } from './components/common/AlertDialog';
import { ConfirmDialog } from './components/common/ConfirmDialog';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' }}>
        <div className="spinner" style={{ color: '#1976D2' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' }}>
        <div className="spinner" style={{ color: '#1976D2' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user.isAdminSuper) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' }}>
        <div className="spinner" style={{ color: '#1976D2' }}></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { initialize } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <BrowserRouter>
      <LoadingBar />
      <ToastContainer />
      <AlertDialog />
      <ConfirmDialog />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/recovery" element={<PublicRoute><PasswordRecovery /></PublicRoute>} />
        <Route path="/password-new" element={<PasswordNew />} />

        {/* Rotas Protegidas (dentro do Layout) */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<MembersSearch />} />
          <Route path="members/new" element={<MemberCU />} />
          <Route path="members/:id" element={<MemberShow />} />
          <Route path="members/:id/edit" element={<MemberCU />} />
          <Route path="meetings" element={<MeetingsSearch />} />
          <Route path="meetings/new" element={<MeetingCU />} />
          <Route path="meetings/:id" element={<MeetingShow />} />
          <Route path="meetings/:id/edit" element={<MeetingCU />} />
          <Route path="meetings/:id/add-member" element={<MeetingMemberAdd />} />
          <Route path="settings" element={<SuperAdminRoute><SettingsPage /></SuperAdminRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
