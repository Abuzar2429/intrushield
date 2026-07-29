import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useMonitoring } from '../../context/MonitoringContext';
import { ArrowRight, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LiveStreamWidget: React.FC = () => {
  const { packets, isLiveStreaming } = useMonitoring();
  const displayPackets = packets.slice(0, 6);

  return (
    <Card
      title="Live Packet Inspection Ticker"
      subtitle="Real-time ring buffer stream from eBPF network probe"
      action={
        <Link
          to="/monitoring"
          className="text-xs font-mono text-blue-500 hover:text-blue-400 flex items-center space-x-1"
        >
          <span>View All Stream</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-2">
        {displayPackets.map((pkt) => (
          <div
            key={pkt.id}
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 font-mono text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-3 truncate">
              <span className="text-slate-400 dark:text-slate-500 text-[11px] shrink-0">{pkt.timestamp}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">{pkt.protocol}</span>
              <span className="text-slate-600 dark:text-slate-400 truncate">
                {pkt.sourceIp}:{pkt.sourcePort} &rarr; {pkt.destinationIp}:{pkt.destinationPort}
              </span>
            </div>

            <div className="flex items-center space-x-3 shrink-0 pl-2">
              <span className="hidden sm:inline text-slate-500 text-[11px]">{pkt.packetSize}B</span>
              <Badge variant={pkt.riskLevel} size="sm">
                {pkt.predictedAttackType}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
        <span className="flex items-center space-x-1.5">
          <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
          <span>Buffer capacity: 10,000 packets (0.02% dropped)</span>
        </span>
        <span className="text-blue-500 font-medium">Inference Latency: 1.4ms</span>
      </div>
    </Card>
  );
};
