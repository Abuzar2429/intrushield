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
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/users" element={<UsersAdminPage />} />
              <Route path="/settings" element={<SettingsPage />} />
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
