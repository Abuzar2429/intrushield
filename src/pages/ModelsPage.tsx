import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Cpu, RefreshCw, Layers, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface AIModelSpec {
  id: string;
  name: string;
  architecture: string;
  version: string;
  status: 'Active' | 'Retraining' | 'Evaluation' | 'Standby';
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  lastTrained: string;
  samplesProcessed: string;
}

const MOCK_MODELS: AIModelSpec[] = [
  {
    id: 'mdl-rf-v4',
    name: 'Random Forest Ensemble v4.2',
    architecture: 'RandomForestClassifier (500 Trees)',
    version: 'v4.2.1-prod',
    status: 'Active',
    precision: 99.4,
    recall: 99.1,
    f1Score: 99.2,
    rocAuc: 0.998,
    lastTrained: '2026-07-28 04:00',
    samplesProcessed: '14.2M flows'
  },
  {
    id: 'mdl-xgb-v3',
    name: 'XGBoost Volumetric Threat Detector',
    architecture: 'Gradient Boosted Decision Trees',
    version: 'v3.8.0-prod',
    status: 'Active',
    precision: 98.9,
    recall: 99.5,
    f1Score: 99.2,
    rocAuc: 0.996,
    lastTrained: '2026-07-27 12:00',
    samplesProcessed: '28.9M flows'
  },
  {
    id: 'mdl-autoenc-v2',
    name: 'Temporal Autoencoder Anomaly Engine',
    architecture: 'LSTM Autoencoder (PyTorch)',
    version: 'v2.1.0-prod',
    status: 'Active',
    precision: 97.6,
    recall: 98.2,
    f1Score: 97.9,
    rocAuc: 0.991,
    lastTrained: '2026-07-29 01:30',
    samplesProcessed: '8.4M flows'
  },
  {
    id: 'mdl-trans-v1',
    name: 'Packet Transformer Payload Classifier',
    architecture: '1D Convolutional Transformer',
    version: 'v1.4.2-eval',
    status: 'Evaluation',
    precision: 99.6,
    recall: 99.4,
    f1Score: 99.5,
    rocAuc: 0.999,
    lastTrained: '2026-07-29 18:00',
    samplesProcessed: '1.2M flows'
  }
];

const DRIFT_DATA = [
  { day: 'Mon', accuracy: 99.5, driftScore: 0.02 },
  { day: 'Tue', accuracy: 99.4, driftScore: 0.03 },
  { day: 'Wed', accuracy: 99.3, driftScore: 0.04 },
  { day: 'Thu', accuracy: 99.4, driftScore: 0.03 },
  { day: 'Fri', accuracy: 99.2, driftScore: 0.06 },
  { day: 'Sat', accuracy: 99.4, driftScore: 0.03 },
  { day: 'Sun', accuracy: 99.5, driftScore: 0.02 },
];

export const ModelsPage: React.FC = () => {
  const [retrainingModelId, setRetrainingModelId] = useState<string | null>(null);

  const handleRetrain = (id: string) => {
    setRetrainingModelId(id);
    setTimeout(() => {
      setRetrainingModelId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">AI Ensemble & Model Governance</h2>
              <Badge variant="success">Ensemble Health Optimal</Badge>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Monitor, evaluate, and trigger online retraining for IntruShield's machine learning models. Built with zero-latency inference and real-time concept drift detection.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Button variant="secondary" size="sm">
              <Layers className="w-4 h-4 mr-1.5" /> Export MLflow Weights
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleRetrain('all')}>
              <RefreshCw className="w-4 h-4 mr-1.5 animate-spin-slow" /> Trigger Ensemble Retrain
            </Button>
          </div>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_MODELS.map((model) => (
          <Card
            key={model.id}
            title={model.name}
            subtitle={`Architecture: ${model.architecture}`}
            headerAction={
              <Badge variant={model.status === 'Active' ? 'success' : 'warning'}>
                {model.status}
              </Badge>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 py-3 px-3 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">PRECISION</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{model.precision}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">RECALL</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{model.recall}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">F1-SCORE</span>
                  <span className="text-xs font-bold text-blue-400 mt-0.5 block">{model.f1Score}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">ROC-AUC</span>
                  <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{model.rocAuc}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Version: <strong className="text-slate-200">{model.version}</strong></span>
                <span>Processed: <strong className="text-slate-200">{model.samplesProcessed}</strong></span>
                <span>Trained: <strong className="text-slate-200">{model.lastTrained}</strong></span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Inference Latency: 1.2ms</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRetrain(model.id)}
                  disabled={retrainingModelId === model.id}
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${retrainingModelId === model.id ? 'animate-spin' : ''}`} />
                  {retrainingModelId === model.id ? 'Retraining...' : 'Retrain Model'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Concept Drift & Accuracy Stability Chart */}
      <Card
        title="7-Day Model Accuracy & Concept Drift Tracking"
        subtitle="Monitors dataset shift and keeps detection boundaries aligned with evolving threat vectors"
      >
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DRIFT_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis yAxisId="left" domain={[98.0, 100.0]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 0.10]} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC' }} />
              <Line yAxisId="left" type="monotone" dataKey="accuracy" name="Validation Accuracy %" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="driftScore" name="KL-Divergence Drift Score" stroke="#D97706" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-400 p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Automatic Drift Threshold Trigger: <strong>KL-Divergence &gt; 0.12</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Current Max Drift: <strong>0.06 (Normal Range)</strong></span>
          </div>
        </div>
      </Card>
    </div>
  );
};
