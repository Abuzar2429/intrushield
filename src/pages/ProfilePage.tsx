import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { UserCheck, Shield, Lock, CheckCircle2, Award, Terminal, LogOut } from 'lucide-react';
import { getStoredUser, authApi } from '../services/apiClient';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(getStoredUser() || {
    name: 'Security User',
    email: 'user@intrushield.service',
    role: 'Client',
    id: 'usr-client-01',
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    authApi.getProfile()
      .then(profile => setUser(profile))
      .catch(() => {
        // Keep cached user if offline
      });
  }, []);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 border-2 border-blue-500/40 flex items-center justify-center text-blue-400 font-mono text-xl font-bold">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">{user.name}</h2>
                <Badge variant="info">{user.role.toUpperCase()}</Badge>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                SOC Email: <strong>{user.email}</strong> | Account ID: <strong>{user.id}</strong>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Member Since: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1.5 text-red-400" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credentials & Access Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Operator Credentials & Security Badges" subtitle="Verified security clearances & SOC active roles">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center space-x-2 text-blue-400">
                  <Shield className="w-4 h-4" />
                  <span className="font-semibold text-slate-200">Active Incident Triage Queue</span>
                </div>
                <p className="text-slate-400 text-[11px]">Assigned to Volumetric DDoS & C2 Ransomware Containment Teams.</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between">
                  <span className="text-slate-500">Active Incidents Assigned:</span>
                  <span className="font-bold text-white">3 Incidents</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Award className="w-4 h-4" />
                  <span className="font-semibold text-slate-200">SIEM & AI Model Authorizations</span>
                </div>
                <p className="text-slate-400 text-[11px]">Full read/write permissions for online model retraining and firewall rule deployment.</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between">
                  <span className="text-slate-500">Privilege Rank:</span>
                  <span className="font-bold text-emerald-400">SuperAdmin / Level-3</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Assigned Operational Responsibilities
              </h4>
              <ul className="space-y-2 font-sans text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Reviewing high-confidence Explainable AI (SHAP) feature attributions for zero-day network traffic.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Authorizing BGP rate-limiting and IP subnet containment rules on core edge routers.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Managing model drift thresholds and evaluating online retraining pipelines.</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* Active Security Sessions */}
          <Card title="Active Operator Sessions" subtitle="Cryptographically verified web and terminal sessions">
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="font-bold text-white block">Current Browser Session (Antigravity SOC Console)</span>
                    <span className="text-[10px] text-slate-400">10.0.1.42 (Local Gateway) | TLS 1.3 / ECDHE-RSA</span>
                  </div>
                </div>
                <Badge variant="success">Active Now</Badge>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="font-bold text-slate-300 block">SSH Terminal Session (Bastion Core)</span>
                    <span className="text-[10px] text-slate-400">10.0.0.1 (Internal Admin Subnet) | Ed25519 Key</span>
                  </div>
                </div>
                <span className="text-slate-400 text-[10px]">Connected 2h ago</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Settings & Hardware Tokens */}
        <div className="space-y-6">
          <Card title="Multi-Factor & Hardware Tokens" subtitle="FIDO2 / YubiKey authentication status">
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Hardware Security Key</span>
                  <Badge variant="success">YubiKey 5C NFC</Badge>
                </div>
                <p className="text-[10px] text-slate-400">Serial: YUBI-90184291-SOC</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">TOTP Authenticator</span>
                  <Badge variant="success">Configured</Badge>
                </div>
                <p className="text-[10px] text-slate-400">Enforced for all administrative actions</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
