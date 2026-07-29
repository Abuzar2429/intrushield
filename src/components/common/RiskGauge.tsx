import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 180,
  label = 'SOC THREAT SCORE',
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle (180deg gauge)
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return '#DC2626'; // Deep Red
    if (score >= 50) return '#D97706'; // Amber
    if (score >= 25) return '#2563EB'; // Muted Blue
    return '#059669'; // Forest Green
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'CRITICAL RISK';
    if (score >= 50) return 'ELEVATED RISK';
    if (score >= 25) return 'MODERATE';
    return 'LOW / NORMAL';
  };

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size * 0.65 }}>
      <svg width={size} height={size / 2 + 10} className="overflow-visible">
        {/* Background Arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-slate-200 dark:text-slate-800"
        />
        {/* Animated Progress Arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute top-8 flex flex-col items-center">
        <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
          {score}
          <span className="text-xs text-slate-400 font-sans font-normal ml-0.5">/100</span>
        </span>
        <span
          className="text-[11px] font-semibold tracking-wider uppercase mt-1 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${getScoreColor()}15`, color: getScoreColor() }}
        >
          {getScoreLabel()}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 font-mono">
          {label}
        </span>
      </div>
    </div>
  );
};
