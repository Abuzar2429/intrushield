import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useMonitoring } from '../context/MonitoringContext';
import { Cpu, Zap, CheckCircle2, AlertOctagon, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const ExplainableAIPage: React.FC = () => {
  const { activeIncident, incidents } = useMonitoring();
  const currentIncident = activeIncident || incidents[0];
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // SHAP feature importance data
  const shapData = currentIncident.explanation.shapWaterfall.map((f) => ({
    name: f.featureName,
    impact: f.impactScore * 100,
    rawVal: String(f.value),
    description: f.description,
  }));

  const selectedFeatureDetails = currentIncident.explanation.shapWaterfall.find(
    (f) => f.featureName === selectedFeature
  );

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
              <h2 className="text-xl font-bold text-white tracking-tight">Explainable AI (XAI) Engine</h2>
              <Badge variant="info">SHAP + LIME Model Interpreter</Badge>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Transparent, model-agnostic feature attribution for SOC analysts. Every AI intrusion flag is backed by exact SHAP waterfall impact values and mathematical decision logic.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Button variant="secondary" size="sm">
              Export SHAP Vectors
            </Button>
            <Button variant="primary" size="sm">
              <Zap className="w-4 h-4 mr-1.5" /> Re-interpret Model
            </Button>
          </div>
        </div>
      </div>

      {/* Target Incident Context Card */}
      <Card title="Current Target Incident Context" subtitle={`Analyzing Incident ID: ${currentIncident.incidentCode}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-900/60 border border-slate-800/80 font-mono text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">THREAT TITLE</span>
            <span className="font-semibold text-slate-200 text-sm truncate block mt-0.5">{currentIncident.title}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">AI RISK LEVEL & SCORE</span>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={currentIncident.riskLevel}>{currentIncident.riskLevel}</Badge>
              <span className="font-bold text-red-400">{currentIncident.riskScore}/100</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">ENSEMBLE CONFIDENCE</span>
            <span className="font-bold text-emerald-400 text-sm block mt-0.5">{currentIncident.confidenceScore}%</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">ATTACK CATEGORY</span>
            <span className="font-semibold text-slate-200 text-sm block mt-0.5">{currentIncident.category}</span>
          </div>
        </div>
      </Card>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SHAP Waterfall Feature Importance Chart */}
        <div className="lg:col-col-span-2 lg:col-span-2 space-y-6">
          <Card
            title="SHAP Feature Contribution Waterfall"
            subtitle="Positive impact scores indicate features pushing prediction toward Malicious classification"
          >
            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={shapData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} width={130} />
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toFixed(1)}% SHAP Impact`, 'Impact Score']}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC' }}
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                    {shapData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.impact > 30 ? '#DC2626' : entry.impact > 15 ? '#D97706' : '#2563EB'}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedFeature(entry.name)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Feature Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Feature Name</th>
                    <th className="pb-2">Observed Value</th>
                    <th className="pb-2">SHAP Weight</th>
                    <th className="pb-2">Direction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {shapData.map((f) => (
                    <tr
                      key={f.name}
                      onClick={() => setSelectedFeature(f.name)}
                      className={`cursor-pointer transition-colors ${
                        selectedFeature === f.name ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 font-sans font-medium">{f.name}</td>
                      <td className="py-2.5 text-slate-200">{f.rawVal}</td>
                      <td className="py-2.5 font-bold">{f.impact.toFixed(1)}%</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 text-[10px] rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          +MALICIOUS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Natural Language AI Decision Summary */}
          <Card title="Natural Language Reasoning Synthesis" subtitle="Auto-generated LLM rationale for human analysts">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 text-sm text-slate-300 font-sans leading-relaxed">
              <div className="flex items-start space-x-3">
                <AlertOctagon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-100">Primary Classification Verdict</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentIncident.explanation.naturalLanguageReasoning}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Feature Inspector & Confidence Distribution */}
        <div className="space-y-6">
          <Card title="Feature Inspector" subtitle="Select a feature from the chart to inspect">
            {selectedFeatureDetails ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">INSPECTED FEATURE</span>
                  <h4 className="text-sm font-bold text-blue-400 mt-0.5">{selectedFeatureDetails.featureName}</h4>
                  <p className="text-xs text-slate-300 mt-2">{selectedFeatureDetails.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">OBSERVED METRIC</span>
                    <span className="font-bold text-white mt-1 block">{String(selectedFeatureDetails.value)}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">SHAP IMPACT</span>
                    <span className="font-bold text-red-400 mt-1 block">{(selectedFeatureDetails.impactScore * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Baseline Expectation</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Standard benign network traffic expects SYN Flag ratio under 12.5%. Observed 98.4% triggers 4.2x std-dev anomaly thresholds.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <BarChart2 className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-mono">Click any row or bar in the SHAP chart to drill down into feature metrics.</p>
              </div>
            )}
          </Card>

          {/* Model Class Probabilities */}
          <Card title="Ensemble Class Probabilities" subtitle="Softmax confidence across candidate attack types">
            <div className="space-y-3 font-mono text-xs">
              {currentIncident.explanation.confidenceDistribution.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{item.label}</span>
                    <span className="font-bold">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.value > 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
