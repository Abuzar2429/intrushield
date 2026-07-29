import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { MOCK_MITRE_TECHNIQUES, MOCK_THREAT_ACTORS, MOCK_CVES } from '../mock/threatIntel';
import type { CVEItem } from '../types/threat';
import { BookOpenCheck, Globe2, AlertTriangle, ExternalLink } from 'lucide-react';

export const ThreatIntelPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCVE, setSelectedCVE] = useState<CVEItem | null>(null);

  const filteredMitre = MOCK_MITRE_TECHNIQUES.filter(
    (t) =>
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tactic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCVEs = MOCK_CVES.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.affectedProtocol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Search */}
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <BookOpenCheck className="w-5 h-5 text-amber-500" />
              <span>MITRE ATT&CK & Threat Intelligence Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Correlated adversarial tactics, active APT threat feeds, and CVE vulnerability references.
            </p>
          </div>

          <div className="w-full md:w-80">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search MITRE ID, technique, or CVE..."
            />
          </div>
        </div>
      </Card>

      {/* MITRE ATT&CK Framework Grid */}
      <Card
        title="MITRE ATT&CK Tactics & Detected Techniques"
        subtitle="Active anomalies auto-mapped to ATT&CK matrix IDs"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMitre.map((tech) => (
            <div
              key={tech.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-amber-500/50 transition-all"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                  {tech.id}
                </span>
                <span className="text-[11px] text-slate-400 uppercase">{tech.tactic}</span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tech.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{tech.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Hits (24h): <strong className="text-slate-900 dark:text-slate-100">{tech.detectedCount}</strong></span>
                <Badge variant={tech.riskLevel} size="sm">{tech.riskLevel}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Threat Actor Profiles & CVE References */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Threat Actor Feeds */}
        <div className="lg:col-span-6">
          <Card
            title="Active APT Threat Actor Feeds"
            subtitle="Intelligence profiles correlated with incoming IPs"
          >
            <div className="space-y-4 font-mono text-xs">
              {MOCK_THREAT_ACTORS.map((actor) => (
                <div key={actor.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe2 className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-slate-900 dark:text-slate-100">{actor.name}</span>
                    </div>
                    <Badge variant={actor.threatLevel} size="sm">{actor.threatLevel}</Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-sans text-xs">{actor.description}</p>
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-between text-[11px] text-slate-500">
                    <span>Origin: {actor.originCountry}</span>
                    <span>Alias: {actor.alias}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* CVE Vulnerability Database */}
        <div className="lg:col-span-6">
          <Card
            title="CVE Vulnerability Advisories"
            subtitle="Targeted protocols & recommended remediation"
          >
            <div className="space-y-3 font-mono text-xs">
              {filteredCVEs.map((cve) => (
                <div
                  key={cve.id}
                  onClick={() => setSelectedCVE(cve)}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-500 text-sm">{cve.id}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 text-[11px]">CVSS {cve.cvssScore}</span>
                      <Badge variant={cve.severity} size="sm">{cve.severity}</Badge>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-sans text-xs line-clamp-2">{cve.summary}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* CVE Inspection Modal */}
      {selectedCVE && (
        <Modal
          isOpen={!!selectedCVE}
          onClose={() => setSelectedCVE(null)}
          title={`Vulnerability Advisory — ${selectedCVE.id}`}
          subtitle={`CVSS Base Score: ${selectedCVE.cvssScore} / 10.0`}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Targeted Protocol: {selectedCVE.affectedProtocol}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[11px]">Executive Summary:</span>
              <p className="font-sans text-xs text-slate-200 leading-relaxed">{selectedCVE.summary}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[11px]">Recommended Mitigation:</span>
              <p className="font-sans text-xs text-slate-200 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                {selectedCVE.mitigationSteps}
              </p>
            </div>

            <div className="pt-2">
              <a
                href={selectedCVE.references[0]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-blue-400 hover:underline"
              >
                <span>View Official CVE Reference</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
