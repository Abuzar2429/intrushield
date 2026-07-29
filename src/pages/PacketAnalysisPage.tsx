import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useMonitoring } from '../context/MonitoringContext';
import { UploadCloud, FileCode2, Play, CheckCircle2, Cpu, ArrowRight, ShieldCheck, Layers } from 'lucide-react';

export const PacketAnalysisPage: React.FC = () => {
  const { pcapResult, analyzePcap, clearPcapResult } = useMonitoring();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const sampleFiles = [
    { name: 'CIC-IDS2017_SYN_Flood_Sample.pcap', size: '14.2 MB', label: 'Volumetric DDoS Attack' },
    { name: 'NSL_KDD_Nmap_PortScan.csv', size: '4.8 MB', label: 'Port Scan Reconnaissance' },
    { name: 'Benign_Internal_HTTPS_Trace.pcap', size: '8.1 MB', label: 'Normal Corporate Traffic' }
  ];

  const handleRunAnalysis = (fileName: string) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      analyzePcap(fileName);
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleRunAnalysis(e.dataTransfer.files[0].name);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <FileCode2 className="w-5 h-5 text-blue-500" />
              <span>PCAP & CSV Feature Extraction Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload captured network traces (`.pcap`, `.pcapng`, `.csv`) to extract 78 CIC-IDS flow features and trigger SHAP AI explanation.
            </p>
          </div>
          {pcapResult && (
            <Button variant="outline" size="sm" onClick={clearPcapResult}>
              Reset Analysis
            </Button>
          )}
        </div>
      </Card>

      {!pcapResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Drag and Drop Zone */}
          <div className="lg:col-span-8">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`p-10 rounded-xl border-2 border-dashed text-center transition-all flex flex-col items-center justify-center space-y-4 ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-700'
              }`}
            >
              <div className="p-4 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Drag and drop PCAP or CSV network trace files
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supports Wireshark `.pcap`, tcpdump `.pcapng`, or pre-parsed `.csv` flow datasets up to 500 MB.
                </p>
              </div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pcap,.pcapng,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleRunAnalysis(e.target.files[0].name);
                  }}
                />
                <Button variant="primary" size="md" isLoading={isAnalyzing} leftIcon={<Play className="w-4 h-4" />}>
                  Browse Local PCAP File
                </Button>
              </label>
            </div>
          </div>

          {/* Preloaded Datasets Picker */}
          <div className="lg:col-span-4">
            <Card title="Preloaded Sample PCAP Datasets" subtitle="Click to benchmark instantly">
              <div className="space-y-3">
                {sampleFiles.map((sf) => (
                  <div
                    key={sf.name}
                    onClick={() => handleRunAnalysis(sf.name)}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-400">
                      <span className="truncate">{sf.name}</span>
                      <span className="text-slate-400 text-[10px] shrink-0 ml-2">{sf.size}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{sf.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Analysis Result Output */}
      {pcapResult && (
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
            <Card className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Total Packets Analyzed</span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {pcapResult.totalPackets.toLocaleString()}
                </span>
              </div>
            </Card>

            <Card className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Extracted Flows</span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {pcapResult.flowCount.toLocaleString()}
                </span>
              </div>
            </Card>

            <Card className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Inference Duration</span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {pcapResult.analysisDurationSeconds}s
                </span>
              </div>
            </Card>

            <Card className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Attack Probability</span>
                <span className="text-lg font-bold text-red-500">
                  {(pcapResult.attackProbability * 100).toFixed(1)}%
                </span>
              </div>
            </Card>
          </div>

          {/* Classification & Feature Importance Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Extracted 78 Features Table */}
            <div className="lg:col-span-7">
              <Card
                title="Extracted Network Flow Feature Vectors"
                subtitle="Calculated statistical metrics used by RandomForest/XGBoost ensemble"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                  {pcapResult.extractedFeatures.map((feat) => (
                    <div
                      key={feat.name}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex justify-between items-center"
                    >
                      <span className="text-slate-600 dark:text-slate-400">{feat.name}:</span>
                      <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                        {feat.value} {feat.unit || ''}
                      </strong>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* SHAP Feature Attribution Card */}
            <div className="lg:col-span-5">
              <Card
                title="SHAP Feature Attribution Visualizer"
                subtitle="Top feature impacts pushing classification towards anomaly"
              >
                <div className="space-y-4 font-mono text-xs">
                  {pcapResult.topContributingFeatures.map((feat) => (
                    <div key={feat.featureName} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{feat.featureName}</span>
                        <span className={feat.impactScore > 0 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>
                          {feat.impactScore > 0 ? `+${feat.impactScore}` : feat.impactScore}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">{feat.description}</p>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${feat.impactScore > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.abs(feat.impactScore) * 150}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
