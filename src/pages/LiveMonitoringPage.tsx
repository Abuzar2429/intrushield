import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { useMonitoring } from '../context/MonitoringContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import type { Packet } from '../types/packet';
import { Pause, Play, Download, Eye, Cpu, ChevronUp, ChevronDown } from 'lucide-react';

const columnHelper = createColumnHelper<Packet>();

export const LiveMonitoringPage: React.FC = () => {
  const { packets, isLiveStreaming, toggleLiveStreaming } = useMonitoring();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [inspectPacket, setInspectPacket] = useState<Packet | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Filter dataset based on search, protocol, and risk
  const filteredPackets = useMemo(() => {
    return packets.filter((pkt) => {
      const matchesSearch =
        pkt.sourceIp.includes(searchTerm) ||
        pkt.destinationIp.includes(searchTerm) ||
        String(pkt.sourcePort).includes(searchTerm) ||
        String(pkt.destinationPort).includes(searchTerm) ||
        pkt.predictedAttackType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProtocol = selectedProtocol === 'ALL' || pkt.protocol === selectedProtocol;
      const matchesRisk = selectedRisk === 'ALL' || pkt.riskLevel === selectedRisk;

      return matchesSearch && matchesProtocol && matchesRisk;
    });
  }, [packets, searchTerm, selectedProtocol, selectedRisk]);

  // Define TanStack Table Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('timestamp', {
        header: 'TIMESTAMP',
        cell: (info) => <span className="font-mono text-slate-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('sourceIp', {
        header: 'SOURCE IP : PORT',
        cell: (info) => (
          <span className="font-mono font-semibold text-blue-400">
            {info.getValue()}:{info.row.original.sourcePort}
          </span>
        ),
      }),
      columnHelper.accessor('destinationIp', {
        header: 'DESTINATION IP : PORT',
        cell: (info) => (
          <span className="font-mono text-slate-300">
            {info.getValue()}:{info.row.original.destinationPort}
          </span>
        ),
      }),
      columnHelper.accessor('protocol', {
        header: 'PROTOCOL',
        cell: (info) => (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('packetSize', {
        header: 'SIZE',
        cell: (info) => <span className="font-mono text-slate-400">{info.getValue()} B</span>,
      }),
      columnHelper.accessor('riskLevel', {
        header: 'RISK LEVEL',
        cell: (info) => <Badge variant={info.getValue()}>{info.getValue()}</Badge>,
      }),
      columnHelper.accessor('predictedAttackType', {
        header: 'AI PREDICTED THREAT',
        cell: (info) => (
          <span
            className={`font-mono text-xs ${
              info.row.original.riskLevel === 'Critical'
                ? 'text-red-400 font-bold'
                : info.row.original.riskLevel === 'High'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-300'
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'ACTION',
        cell: (info) => {
          const val = info.getValue();
          return (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                val === 'Dropped'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : val === 'Flagged'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {val.toUpperCase()}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'inspect',
        header: 'INSPECT',
        cell: (info) => (
          <button
            onClick={() => setInspectPacket(info.row.original)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Inspect Packet Payload"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        ),
      }),
    ],
    []
  );

  // TanStack Table Instance
  const table = useReactTable({
    data: filteredPackets,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 12,
      },
    },
  });

  const exportCSV = () => {
    const headers = 'ID,Timestamp,Source IP,Source Port,Destination IP,Destination Port,Protocol,Size (B),Risk,Attack Type,Status\n';
    const rows = filteredPackets
      .map(
        (p) =>
          `"${p.id}","${p.timestamp}","${p.sourceIp}",${p.sourcePort},"${p.destinationIp}",${p.destinationPort},"${p.protocol}",${p.packetSize},"${p.riskLevel}","${p.predictedAttackType}","${p.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intrushield-packets-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              placeholder="Search Source/Dest IP, Port, or Attack type..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Protocol:</span>
              <select
                value={selectedProtocol}
                onChange={(e) => setSelectedProtocol(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none"
              >
                <option value="ALL">ALL</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="HTTP">HTTP</option>
                <option value="DNS">DNS</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Risk:</span>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none"
              >
                <option value="ALL">ALL</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            <Button
              variant={isLiveStreaming ? 'outline' : 'success'}
              size="sm"
              onClick={toggleLiveStreaming}
              leftIcon={isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            >
              {isLiveStreaming ? 'Pause Feed' : 'Resume Feed'}
            </Button>

            <Button variant="secondary" size="sm" onClick={exportCSV} leftIcon={<Download className="w-3.5 h-3.5" />}>
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* TanStack Table Card */}
      <Card
        title={`Live Inspection Stream (${table.getFilteredRowModel().rows.length} total packets)`}
        subtitle="TanStack Table powered — Sort headers or inspect raw hex payload samples"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-800 text-slate-400 font-mono">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`pb-3 px-3 cursor-pointer select-none ${
                        header.column.getCanSort() ? 'hover:text-white' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {{
                          asc: <ChevronUp className="w-3 h-3 text-blue-400" />,
                          desc: <ChevronDown className="w-3 h-3 text-blue-400" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TanStack Table Pagination Controls */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs font-mono text-slate-400">
          <div>
            Showing Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{' '}
            <strong>{table.getPageCount()}</strong> ({filteredPackets.length} total rows)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Packet Inspection Modal */}
      {inspectPacket && (
        <Modal
          isOpen={!!inspectPacket}
          onClose={() => setInspectPacket(null)}
          title={`Packet Inspection Payload: ${inspectPacket.id}`}
          size="lg"
        >
          <div className="space-y-4 font-mono text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">SOURCE</span>
                <span className="font-bold text-blue-400">
                  {inspectPacket.sourceIp}:{inspectPacket.sourcePort}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DESTINATION</span>
                <span className="font-bold text-slate-200">
                  {inspectPacket.destinationIp}:{inspectPacket.destinationPort}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PROTOCOL</span>
                <span>{inspectPacket.protocol}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PACKET SIZE</span>
                <span>{inspectPacket.packetSize} Bytes</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">HEX & ASCII PAYLOAD SAMPLE</span>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                {inspectPacket.payloadSample || '[NO DATA PAYLOAD]'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>AI Risk Score: <strong>{inspectPacket.riskScore}/100</strong></span>
              </div>
              <Badge variant={inspectPacket.riskLevel}>{inspectPacket.riskLevel}</Badge>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
