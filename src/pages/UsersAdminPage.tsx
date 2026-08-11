import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Users, RefreshCw, AlertTriangle } from 'lucide-react';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: 'Administrator' | 'Analyst' | 'Auditor';
  createdAt: string;
}

export const UsersAdminPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('intrushield_token');
      const response = await fetch('/api/users', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Administrator privileges required to access User Governance.');
        }
        throw new Error('Failed to fetch security users list.');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      // Fallback mock users if API is restricted or server offline
      setUsers([
        { id: 'usr-1', name: 'SOC Lead Analyst', email: 'admin@intrushield.io', role: 'Administrator', createdAt: '2026-01-15T08:00:00.000Z' },
        { id: 'usr-2', name: 'Junior Threat Investigator', email: 'analyst1@intrushield.io', role: 'Analyst', createdAt: '2026-03-20T10:30:00.000Z' },
        { id: 'usr-3', name: 'Compliance Auditor', email: 'auditor@intrushield.io', role: 'Auditor', createdAt: '2026-05-10T14:15:00.000Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const token = localStorage.getItem('intrushield_token');
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role. Administrator privileges required.');
      }

      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Role update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'critical';
      case 'Analyst':
        return 'info';
      case 'Auditor':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>SOC Security Team Access & User Governance</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Role-Based Access Control (RBAC) portal for managing analyst roles and security privileges.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Team List
          </Button>
        </div>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3 text-amber-400 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card title="Registered Security Analysts" subtitle={`Total Analysts: ${users.length}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Security Analyst</th>
                <th className="px-4 py-3">Email Contact</th>
                <th className="px-4 py-3">Current Role</th>
                <th className="px-4 py-3">Account Joined</th>
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

                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <select
                      value={user.role}
                      disabled={updatingId === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
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
    </div>
  );
};
