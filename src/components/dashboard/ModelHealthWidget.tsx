import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Cpu, CheckCircle2, Zap } from 'lucide-react';

export const ModelHealthWidget: React.FC = () => {
  return (
    <Card
      title="AI Detection Engine & Model Health"
      subtitle="Supervised Ensemble (RandomForest + XGBoost) + SHAP Explainability Pipeline"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase">Detection Accuracy</span>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">99.42%</div>
            <span className="text-[10px] text-emerald-500">F1-Score: 0.991</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase">Avg Inference Latency</span>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">1.42 ms</div>
            <span className="text-[10px] text-blue-400">&lt;2ms SLA met</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase">False Positive Rate</span>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">0.08%</div>
            <span className="text-[10px] text-purple-400">Low false alarm</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
        <span>Active Model Version: <strong className="text-slate-700 dark:text-slate-300 font-normal">NSL-KDD/CIC-2026-v4.1</strong></span>
        <Badge variant="Normal" size="sm">ONLINE & TRAINING READY</Badge>
      </div>
    </Card>
  );
};
