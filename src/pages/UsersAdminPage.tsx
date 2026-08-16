import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Users, RefreshCw, AlertTriangle, ShieldCheck, FileSearch, Clock, Activity } from 'lucide-react';
import { usersApi } from '../services/apiClient';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: 'Administrator' | 'Client' | 'Analyst' | 'Auditor';
  lastLogin?: string | null;
  lastActivity?: string | null;
  scanCount?: number;
  createdAt: string;
}

interface AuditLogRecord {
  id: string;
  userId?: string;
  email?: string;
  action: string;
  endpoint: string;
  method: string;
  ipAddress: string;
  statusCode: number;
  details?: Record<string, any>;
  createdAt: string;
}

export const UsersAdminPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsersAndLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getUsers();
      setUsers(data.users || []);

      try {
        const logsData = await usersApi.getAuditLogs();
        setAuditLogs(logsData.logs || []);
      } catch (_logErr) {
        // Audit log fetch non-fatal
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      // Fallback mock users if API is restricted or server offline
      setUsers([
        { id: 'usr-1', name: 'SOC Lead Administrator', email: 'admin@intrushield.service', role: 'Administrator', scanCount: 12, lastLogin: new Date().toISOString(), lastActivity: new Date().toISOString(), createdAt: '2026-01-15T08:00:00.000Z' },
        { id: 'usr-2', name: 'Client Security User', email: 'client@intrushield.service', role: 'Client', scanCount: 3, lastLogin: new Date(Date.now() - 3600000).toISOString(), lastActivity: new Date(Date.now() - 1800000).toISOString(), createdAt: '2026-03-20T10:30:00.000Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndLogs();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      await usersApi.updateRole(userId, newRole);
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole as any } : u)));
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadgeVariant = (role: string): any => {
    switch (role) {
      case 'Administrator': return 'critical';
      case 'Client': return 'success';
      case 'Analyst': return 'warning';
      case 'Auditor': return 'info';
      default: return 'default';
    }
  };

  const formatTimeAgo = (iso?: string | null) => {
    if (!iso) return 'Never';
    const date = new Date(iso);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 font-sans">
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">User Governance & Activity Audit</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Service Owner Control Console: Monitor registered client accounts, activity timestamps, scan counts, and security audit logs.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsersAndLogs}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Audit Data
          </Button>
        </div>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3 text-amber-400 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card title="Registered Service Accounts & Activity Metrics" subtitle={`Total Accounts: ${users.length}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Account Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">PCAP Scans</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3">Last Activity</th>
                <th className="px-4 py-3 text-right">Role Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-sans">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </td>

                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono">{user.email}</td>

                  <td className="px-4 py-3.5">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="flex items-center space-x-1 font-semibold text-blue-400">
                      <FileSearch className="w-3.5 h-3.5 text-blue-500" />
                      <span>{user.scanCount || 0}</span>
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                    {formatTimeAgo(user.lastLogin)}
                  </td>

                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{formatTimeAgo(user.lastActivity)}</span>
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <select
                      value={user.role}
                      disabled={updatingId === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Client">Client</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Analyst">Analyst</option>
                      <option value="Auditor">Auditor</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="System Audit Logs & Security Events" subtitle={`Recent Security Events: ${auditLogs.length}`}>
        <div className="overflow-x-auto">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-500 p-4">No audit logs recorded yet. Security events will appear here automatically.</p>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Event Action</th>
                  <th className="px-4 py-3">User Identity</th>
                  <th className="px-4 py-3">HTTP Method / Endpoint</th>
                  <th className="px-4 py-3">Client IP</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {auditLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-blue-400">
                      {log.action}
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">
                      {log.email || log.userId || 'Anonymous / Unauthenticated'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">
                      <span className="font-bold text-slate-200 mr-1">{log.method}</span>
                      <span>{log.endpoint}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{log.ipAddress}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={log.statusCode < 400 ? 'success' : log.statusCode === 403 ? 'critical' : 'warning'} size="sm">
                        {log.statusCode}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};
