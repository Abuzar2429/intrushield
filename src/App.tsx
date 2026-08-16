import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MonitoringProvider } from './context/MonitoringContext';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Dashboard / Application Pages
import { DashboardPage } from './pages/DashboardPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { PacketAnalysisPage } from './pages/PacketAnalysisPage';
import { ThreatIntelPage } from './pages/ThreatIntelPage';
import { ExplainableAIPage } from './pages/ExplainableAIPage';
import { AlertsHistoryPage } from './pages/AlertsHistoryPage';
import { IncidentDetailsPage } from './pages/IncidentDetailsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ModelsPage } from './pages/ModelsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { UsersAdminPage } from './pages/UsersAdminPage';

import { getStoredUser } from './services/apiClient';
import { ShieldAlert } from 'lucide-react';

const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getStoredUser();
  const isAdmin = user?.role === 'Administrator';

  if (!isAdmin) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">403 - Access Denied</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
          Administrator privileges are required to access this resource. Client accounts do not have clearance for system governance or configuration.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <MonitoringProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing & Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Authenticated SOC Application Layout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/monitoring" element={<LiveMonitoringPage />} />
              <Route path="/pcap-analysis" element={<PacketAnalysisPage />} />
              <Route path="/threat-intel" element={<ThreatIntelPage />} />
              <Route path="/explainable-ai" element={<ExplainableAIPage />} />
              <Route path="/alerts" element={<AlertsHistoryPage />} />
              <Route path="/incidents" element={<IncidentDetailsPage />} />
              <Route path="/incidents/:id" element={<IncidentDetailsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/models" element={<AdminRouteGuard><ModelsPage /></AdminRouteGuard>} />
              <Route path="/users" element={<AdminRouteGuard><UsersAdminPage /></AdminRouteGuard>} />
              <Route path="/settings" element={<AdminRouteGuard><SettingsPage /></AdminRouteGuard>} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MonitoringProvider>
    </ThemeProvider>
  );
}

export default App;
