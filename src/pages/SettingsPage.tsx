import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useTheme } from '../context/ThemeContext';
import { Settings, Moon, Sun, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [sensitivity, setSensitivity] = useState(0.75);
  const [minConfidence, setMinConfidence] = useState(85);
  const [autoBlock, setAutoBlock] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-500" />
              <span>SOC Platform Configuration & AI Model Thresholds</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tune anomaly sensitivity sliders, automated mitigation rules, API keys, and notification webhooks.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            {saved ? 'Settings Saved!' : 'Save Configuration'}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Threshold Parameters */}
        <div className="lg:col-span-6">
          <Card title="AI Ensemble Threshold Tuning" subtitle="RandomForest & XGBoost classification parameters">
            <div className="space-y-5 font-mono text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Anomaly Detection Sensitivity</span>
                  <span className="font-bold text-blue-500">{sensitivity}</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-[11px] text-slate-400 font-sans">
                  Higher threshold reduces false positives but may miss subtle low-rate probing.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Minimum XAI Confidence Floor</span>
                  <span className="font-bold text-blue-500">{minConfidence}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="99"
                  step="1"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Automated Firewall BGP Block</span>
                  <span className="text-[11px] text-slate-400 font-sans">Automatically rate-limit critical subnets</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoBlock}
                  onChange={(e) => setAutoBlock(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* API Keys & Notifications */}
        <div className="lg:col-span-6">
          <Card title="API Keys & Webhook Integrations" subtitle="Connect SIEM, PagerDuty, or Slack alerts">
            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">SIEM Export API Key</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    readOnly
                    value="is_live_key_9821a0f9124b8921e0a811"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-300 font-mono"
                  />
                  <Button variant="outline" size="sm">Rotate</Button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">PagerDuty Webhook URL</span>
                <input
                  type="text"
                  defaultValue="https://events.pagerduty.com/v2/enqueue/intrushield-soc"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-300 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Appearance Theme</span>
                  <span className="text-[11px] text-slate-400 font-sans">Toggle light / dark SOC theme</span>
                </div>
                <Button variant="outline" size="sm" onClick={toggleTheme} leftIcon={theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}>
                  {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
