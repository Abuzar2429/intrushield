import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useMonitoring } from '../../context/MonitoringContext';
import { AlertOctagon, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CriticalAlertsList: React.FC = () => {
  const { incidents, setActiveIncident } = useMonitoring();
  const navigate = useNavigate();

  const handleSelectIncident = (inc: any) => {
    setActiveIncident(inc);
    navigate('/incidents');
  };

  return (
    <Card
      title="Critical SOC Incidents"
      subtitle="Prioritized AI-detected anomalies requiring immediate triage"
      action={
        <Link
          to="/incidents"
          className="text-xs font-mono text-blue-500 hover:text-blue-400 flex items-center space-x-1"
        >
          <span>All Incidents ({incidents.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-3">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            onClick={() => handleSelectIncident(inc)}
            className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all flex flex-col space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-mono text-xs text-slate-400">{inc.incidentCode}</span>
                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-400 transition-colors">
                  {inc.title}
                </span>
              </div>
              <Badge variant={inc.riskLevel} size="sm">
                {inc.riskLevel}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center space-x-3">
                <span>Attacker: <strong className="text-slate-700 dark:text-slate-300 font-normal">{inc.primaryAttackerIp}</strong></span>
                <span>Target: <strong className="text-slate-700 dark:text-slate-300 font-normal">{inc.targetedHostIp}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-blue-500 font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>XAI Confidence: {inc.confidenceScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
