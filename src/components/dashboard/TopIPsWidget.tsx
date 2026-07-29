import React from 'react';
import { Card } from '../common/Card';

export const TopIPsWidget: React.FC = () => {
  const topSourceIps = [
    { ip: '185.220.101.44', location: 'DE (Tor Exit)', attackCount: '142,500', threat: 'SYN Flood' },
    { ip: '45.142.214.12', location: 'RU (Hosted)', attackCount: '84,100', threat: 'SSH Brute' },
    { ip: '91.240.118.50', location: 'NL (Proxy)', attackCount: '32,800', threat: 'Nmap Scan' },
    { ip: '192.168.1.105', location: 'Internal LAN', attackCount: '12,400', threat: 'SQLi Attempt' },
  ];

  const topPorts = [
    { port: 443, service: 'HTTPS', volume: '1.2 GB', share: 45 },
    { port: 80, service: 'HTTP', volume: '480 MB', share: 22 },
    { port: 22, service: 'SSH', volume: '140 MB', share: 12 },
    { port: 53, service: 'DNS', volume: '95 MB', share: 8 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top Suspicious IPs */}
      <Card title="Top Offending Source IPs" subtitle="Most active malicious origins in 24h">
        <div className="space-y-2.5">
          {topSourceIps.map((item) => (
            <div
              key={item.ip}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 font-mono text-xs"
            >
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{item.ip}</span>
                <span className="text-[11px] text-slate-400 ml-2">({item.location})</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-red-500">{item.attackCount}</span>
                <span className="text-[10px] text-slate-400 ml-2 uppercase">[{item.threat}]</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Targeted Ports */}
      <Card title="Top Targeted Destination Ports" subtitle="Services receiving highest threat volume">
        <div className="space-y-2.5">
          {topPorts.map((item) => (
            <div key={item.port} className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>
                  Port <strong>{item.port}</strong> ({item.service})
                </span>
                <span>{item.volume} ({item.share}%)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.share}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
