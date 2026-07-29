import React from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useMonitoring } from '../context/MonitoringContext';
import { AlertOctagon, ShieldAlert, Cpu, CheckCircle2, Clock, ShieldCheck, Download } from 'lucide-react';
import { generateIncidentPdf } from '../utils/pdfExport';

export const IncidentDetailsPage: React.FC = () => {
  const { incidents, activeIncident, setActiveIncident } = useMonitoring();
  const currentIncident = activeIncident || incidents[0];

  return (
    <div className="space-y-6">
      {/* Top Incident Selector Selector */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-slate-400">{currentIncident.incidentCode}</span>
                <Badge variant={currentIncident.riskLevel}>{currentIncident.riskLevel}</Badge>
                <Badge variant="secondary">{currentIncident.status}</Badge>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {currentIncident.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={currentIncident.id}
              onChange={(e) => {
                const found = incidents.find((i) => i.id === e.target.value);
                if (found) setActiveIncident(found);
              }}
              className="px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.incidentCode} — {inc.category}
                </option>
              ))}
            </select>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => generateIncidentPdf(currentIncident)}
            >
              Export PDF Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Incident Metrics & XAI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <Card className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Threat Risk Score</span>
            <span className="text-xl font-bold text-red-500">{currentIncident.riskScore} / 100</span>
          </div>
        </Card>

        <Card className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">XAI Model Confidence</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{currentIncident.confidenceScore}%</span>
          </div>
        </Card>

        <Card className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Attacker IP</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{currentIncident.primaryAttackerIp}</span>
          </div>
        </Card>

        <Card className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Target Host</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{currentIncident.targetedHostIp}</span>
          </div>
        </Card>
      </div>

      {/* Explainable AI (SHAP) & Natural Language Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SHAP Waterfall Attribution Visualizer */}
        <div className="lg:col-span-7">
          <Card
            title="Explainable AI (SHAP Waterfall Feature Attribution)"
            subtitle="Transparent feature impact scores behind AI threat classification"
          >
            <div className="space-y-4 font-mono text-xs">
              {currentIncident.explanation.shapWaterfall.map((feat) => (
                <div key={feat.featureName} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">{feat.featureName}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 text-[11px] font-normal">{feat.value}</span>
                      <span className="text-red-500 font-bold">+{feat.impactScore}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">{feat.description}</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${feat.impactScore * 180}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span>Natural Language Reasoning Engine Output</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                {currentIncident.explanation.naturalLanguageReasoning}
              </p>
            </div>
          </Card>
        </div>

        {/* Chronological Incident Timeline */}
        <div className="lg:col-span-5">
          <Card title="Incident Chronological Timeline" subtitle="Correlated SOC detection milestones">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {currentIncident.timeline.map((event) => (
                <div key={event.id} className="relative space-y-1">
                  <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900" />
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{event.timestamp}</span>
                    <Badge variant={event.severity} size="sm">{event.severity}</Badge>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{event.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{event.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recommended Remediation Actions */}
      <Card title="Recommended SOC Remediation Controls" subtitle="One-click firewall and host containment execution">
        <div className="space-y-3">
          {currentIncident.remediationActions.map((action) => (
            <div
              key={action.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{action.actionTitle}</span>
                  <Badge variant={action.executed ? 'success' : 'warning'} size="sm">
                    {action.executed ? 'EXECUTED' : 'PENDING APPROVAL'}
                  </Badge>
                </div>
                <p className="text-slate-500 font-sans text-xs">{action.recommendedReason}</p>
                <span className="text-slate-400 text-[11px] block">Target: {action.target}</span>
              </div>

              <div>
                <Button
                  variant={action.executed ? 'secondary' : 'danger'}
                  size="sm"
                  disabled={action.executed}
                  leftIcon={action.executed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                >
                  {action.executed ? 'Enforced' : 'Execute Control'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
