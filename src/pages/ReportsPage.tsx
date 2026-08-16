import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, Calendar } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [showExportModal, setShowExportModal] = useState(false);

  const reportMetrics = [
    { title: 'Total Network Volume Scanned', value: '42.8 GB', sub: '100% Packet Line-rate' },
    { title: 'Total Threat Incidents Flagged', value: '14 Incidents', sub: '99.4% Precision' },
    { title: 'Automated Firewall Blocks', value: '8 Subnets', sub: 'BGP Flowspec' },
    { title: 'SOC Mean-Time-To-Detect (MTTD)', value: '1.42 Seconds', sub: '<2.0s SLA Goal' }
  ];

  const complianceStandards = [
    { name: 'ISO/IEC 27001:2022', status: 'Compliant', clause: 'A.8.16 Monitoring Activities' },
    { name: 'SOC 2 Type II Security', status: 'Compliant', clause: 'CC6.8 Threat Detection' },
    { name: 'NIST SP 800-53 Rev. 5', status: 'Compliant', clause: 'SI-4 System Monitoring' },
    { name: 'PCI-DSS v4.0 Requirement 10', status: 'Compliant', clause: '10.4 Anomaly Analysis' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span>Executive Security Reports & Compliance Audits</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generate standardized incident summaries formatted for executive leadership and compliance auditors.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-slate-700 dark:text-slate-200"
              >
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Q3 2026 Audit Period</option>
              </select>
            </div>

            <Button variant="primary" size="sm" onClick={() => setShowExportModal(true)} leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Export Executive PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* High level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {reportMetrics.map((m) => (
          <Card key={m.title}>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{m.title}</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 block">{m.value}</span>
            <span className="text-[11px] text-blue-500 mt-1 block">{m.sub}</span>
          </Card>
        ))}
      </div>

      {/* Compliance Audit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card title="Regulatory Compliance Verification" subtitle="Automated mapping against global security benchmarks">
            <div className="space-y-3 font-mono text-xs">
              {complianceStandards.map((st) => (
                <div
                  key={st.name}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{st.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{st.clause}</span>
                  </div>
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    {st.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Executive Summary Notes */}
        <div className="lg:col-span-5">
          <Card title="Executive Notes & SOC Attestation" subtitle="Prepared by IntruShield Security Operations">
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
              <p>
                During the evaluated period (<strong>{dateRange}</strong>), IntruShield processed 100% of network edge traffic with zero unhandled drop events.
              </p>
              <p>
                All 14 flagged threat anomalies were inspected by the supervised Random Forest ensemble model and attributed via SHAP feature importance vectors prior to firewall block execution.
              </p>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 font-mono text-xs text-blue-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Audit Signature Hash: 0x8f2a...c901 Verified</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Printable Report Export Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Executive Security Report Export Preview"
          subtitle="IntruShield Report #REP-2026-0729"
          maxWidth="2xl"
        >
          <div className="space-y-4 font-mono text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-sm">IntruShield Enterprise Report</span>
                <span className="text-slate-500 text-[10px]">Generated: 2026-07-29</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Timeframe: <strong>{dateRange}</strong></div>
                <div>Status: <strong className="text-emerald-400">PASSED AUDIT</strong></div>
                <div>Total Volume: <strong>42.8 GB</strong></div>
                <div>MTTD: <strong>1.42s</strong></div>
              </div>

              <div className="p-3 rounded bg-slate-900 border border-slate-800 font-sans text-xs text-slate-400">
                This document certifies that IntruShield AI Network Intrusion Detection System detected, classified, and mitigated all network layer anomalies within SLA thresholds.
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  window.print();
                  setShowExportModal(false);
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF / Print
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
