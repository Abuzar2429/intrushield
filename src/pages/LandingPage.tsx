import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  Cpu,
  FileSearch,
  BookOpenCheck,
  FileText,
  ArrowRight,
  ShieldCheck,
  Radio,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-blue-500" />,
      title: 'AI Anomaly Detection',
      description: 'Supervised Random Forest & XGBoost ensemble trained on CIC-IDS datasets for real-time packet classification.'
    },
    {
      icon: <Activity className="w-6 h-6 text-emerald-500" />,
      title: 'eBPF Real-Time Stream',
      description: 'Kernel-level eBPF probes capturing and scoring network throughput up to 10 Gbps with <2ms latency.'
    },
    {
      icon: <BookOpenCheck className="w-6 h-6 text-amber-500" />,
      title: 'MITRE ATT&CK Mapping',
      description: 'Automated correlation of incoming anomalies against MITRE ATT&CK tactics, techniques, and CVE databases.'
    },
    {
      icon: <FileSearch className="w-6 h-6 text-purple-500" />,
      title: 'Explainable AI (XAI)',
      description: 'SHAP (SHapley Additive exPlanations) visualizers providing transparent, human-readable reasoning for every alert.'
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      title: 'Automated SOC Reporting',
      description: 'One-click executive reports formatted for CISO review, ISO 27001 audits, and NIST compliance.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-indigo-500" />,
      title: 'Granular Analytics',
      description: 'Historical traffic timelines, protocol distribution heatmaps, and model false-positive tracking.'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Ingest Network Packets',
      subtitle: 'PCAP / Live Ring Buffer',
      description: 'Kernel-level eBPF drivers mirror raw Ethernet frames and extract 78 statistical network flow features in microsecond intervals.'
    },
    {
      step: '02',
      title: 'AI Inspection & XAI Attribution',
      subtitle: 'Ensemble Classification',
      description: 'Trained models evaluate packet flow vectors against known attack signatures while SHAP algorithms generate feature importance scores.'
    },
    {
      step: '03',
      title: 'Automated SOC Remediation',
      subtitle: 'Response & Compliance',
      description: 'Trigger edge firewall block rules, isolate infected hosts, notify analysts, and compile verified audit trails.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white font-sans">
              Intru<span className="text-blue-500">Shield</span>
            </span>
            <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
              ENTERPRISE NIDS
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#specs" className="hover:text-blue-400 transition-colors">Security Specs</a>
            <a href="#compliance" className="hover:text-blue-400 transition-colors">Compliance</a>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/auth/login">
              <Button variant="outline" size="sm">SOC Login</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Platform
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI-POWERED NETWORK INTRUSION DETECTION SYSTEM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise Network Threat Analysis with <span className="text-blue-500">Explainable AI</span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
              IntruShield delivers continuous eBPF network packet inspection, machine-learning anomaly detection, and transparent SHAP explanations for modern Security Operations Centres.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/dashboard">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Explore SOC Dashboard
                </Button>
              </Link>
              <Link to="/pcap-analysis">
                <Button size="lg" variant="secondary" leftIcon={<FileSearch className="w-5 h-5 text-blue-400" />}>
                  Upload PCAP Trace Demo
                </Button>
              </Link>
            </div>

            {/* Spec highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 font-mono text-xs text-slate-400">
              <div>
                <span className="block text-xl font-bold text-white">99.42%</span>
                <span>Detection Accuracy</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-white">&lt; 1.5 ms</span>
                <span>Inference Latency</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-white">10 Gbps</span>
                <span>Line-rate Throughput</span>
              </div>
            </div>
          </div>

          {/* Hero Right Interactive SVG Topology Simulator */}
          <div className="lg:col-span-5">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
                <div className="flex items-center space-x-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-slate-200">LIVE TOPOLOGY THREAT MONITOR</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  SYN FLOOD DETECTED
                </span>
              </div>

              {/* Network Graph Simulation SVG */}
              <div className="relative h-64 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center p-4">
                <svg className="w-full h-full" viewBox="0 0 400 220">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="110" x2="400" y2="110" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="170" x2="400" y2="170" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Connecting Lines */}
                  <line x1="60" y1="110" x2="200" y2="60" stroke="#EF4444" strokeWidth="2" className="animate-pulse" />
                  <line x1="60" y1="110" x2="200" y2="160" stroke="#3B82F6" strokeWidth="1.5" />
                  <line x1="200" y1="60" x2="340" y2="110" stroke="#EF4444" strokeWidth="2" />
                  <line x1="200" y1="160" x2="340" y2="110" stroke="#10B981" strokeWidth="1.5" />

                  {/* Node 1: Attacker */}
                  <g transform="translate(60, 110)">
                    <circle r="18" fill="#1E1B4B" stroke="#DC2626" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fill="#EF4444" fontSize="10" fontFamily="monospace" fontWeight="bold">EXT IP</text>
                    <text x="0" y="28" textAnchor="middle" fill="#9CA3AF" fontSize="8" fontFamily="monospace">185.220.101.44</text>
                  </g>

                  {/* Node 2: Firewall / AI Model */}
                  <g transform="translate(200, 60)">
                    <rect x="-24" y="-16" width="48" height="32" rx="6" fill="#0F172A" stroke="#2563EB" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fill="#60A5FA" fontSize="10" fontFamily="monospace" fontWeight="bold">AI ENGINE</text>
                    <text x="0" y="28" textAnchor="middle" fill="#9CA3AF" fontSize="8" fontFamily="monospace">SHAP XAI</text>
                  </g>

                  {/* Node 3: Internal Switch */}
                  <g transform="translate(200, 160)">
                    <rect x="-24" y="-16" width="48" height="32" rx="6" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
                    <text x="0" y="4" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">SWITCH</text>
                  </g>

                  {/* Node 4: Target Server */}
                  <g transform="translate(340, 110)">
                    <circle r="18" fill="#064E3B" stroke="#059669" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fill="#34D399" fontSize="10" fontFamily="monospace" fontWeight="bold">TARGET</text>
                    <text x="0" y="28" textAnchor="middle" fill="#9CA3AF" fontSize="8" fontFamily="monospace">10.0.4.12:443</text>
                  </g>
                </svg>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Model Classification:</span>
                <span className="text-red-400 font-semibold">SYN Flood (99.2% Confidence)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 px-6 border-b border-slate-800/60 bg-slate-900/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Enterprise SOC Capabilities
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Designed from the ground up for security analysts who require precision, high performance, and zero visual noise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3 group"
              >
                <div className="p-3 rounded-lg bg-slate-800/80 w-fit group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section id="workflow" className="py-20 px-6 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Automated Detection & Mitigation Workflow
            </h2>
            <p className="text-slate-400 text-sm">
              From raw packet ingestion to automated firewall enforcement in milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflowSteps.map((ws, i) => (
              <div
                key={i}
                onClick={() => setActiveStep(i)}
                className={`p-6 rounded-xl border transition-all cursor-pointer space-y-4 ${
                  activeStep === i
                    ? 'bg-slate-900 border-blue-500/60 shadow-lg'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="text-2xl font-bold text-blue-500">{ws.step}</span>
                  <span className="text-xs text-slate-500 uppercase">{ws.subtitle}</span>
                </div>
                <h3 className="text-base font-semibold text-white">{ws.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{ws.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6 bg-slate-900/60">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">
            Ready to inspect network traffic with enterprise AI?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Launch the IntruShield SOC Dashboard or test our feature extraction engine with sample PCAP files.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/dashboard">
              <Button size="lg" variant="primary" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Launch SOC Dashboard Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-blue-500" />
            <span className="text-slate-300 font-bold">IntruShield Enterprise</span>
            <span>&copy; 2026 IntruShield Security Technologies Inc.</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="hover:text-slate-300">SOC Dashboard</Link>
            <Link to="/pcap-analysis" className="hover:text-slate-300">PCAP Inspector</Link>
            <Link to="/threat-intel" className="hover:text-slate-300">MITRE Matrix</Link>
            <Link to="/settings" className="hover:text-slate-300">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
