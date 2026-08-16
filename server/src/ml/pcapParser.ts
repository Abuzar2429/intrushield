/**
 * IntruShield Binary PCAP & PCAPNG Parser & Flow Feature Extractor (v2 Expanded)
 * Parses raw .pcap and .pcapng binary buffers, extracts 5-tuple network flows,
 * and calculates statistical CIC-IDS2017 style flow features + source diversity window metrics.
 */

export interface ParsedPacket {
  timestampMs: number;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'OTHER';
  packetSize: number;
  headerLength: number;
  payloadLength: number;
  payloadBuffer: Buffer;
  tcpFlags: {
    fin: boolean;
    syn: boolean;
    rst: boolean;
    psh: boolean;
    ack: boolean;
    urg: boolean;
  };
}

export interface NetworkFlowFeatures {
  flowId: string;
  sourceIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
  protocol: string;
  firstTimestampMs: number;
  lastTimestampMs: number;
  
  // 35 Expanded CICFlowMeter Features
  flowDurationUs: number;          // Microseconds
  totalFwdPackets: number;
  totalBwdPackets: number;
  totalFwdBytes: number;
  totalBwdBytes: number;
  fwdPacketLengthMin: number;
  fwdPacketLengthMax: number;
  fwdPacketLengthMean: number;
  fwdPacketLengthStd: number;
  bwdPacketLengthMin: number;
  bwdPacketLengthMax: number;
  bwdPacketLengthMean: number;
  bwdPacketLengthStd: number;
  flowBytesPerSec: number;
  flowPacketsPerSec: number;
  flowIATMeanUs: number;           // Microseconds
  flowIATStdUs: number;            // Microseconds
  flowIATMinUs: number;            // Microseconds
  flowIATMaxUs: number;            // Microseconds
  fwdIATMeanUs: number;            // Microseconds
  fwdIATStdUs: number;             // Microseconds
  bwdIATMeanUs: number;            // Microseconds
  bwdIATStdUs: number;             // Microseconds
  fwdPacketsPerSec: number;
  bwdPacketsPerSec: number;
  synFlagCount: number;
  ackFlagCount: number;
  finFlagCount: number;
  rstFlagCount: number;
  pshFlagCount: number;
  averagePacketSizeBytes: number;
  downUpRatio: number;             // Bwd / Fwd ratio
  payloadEntropy: number;
  destinationPortCategory: number; // 21: FTP, 22: SSH, 80/443: Web, 53: DNS, 0: Other
  sourceDiversityRatio: number;    // Unique Src IPs / Total Flows in 10s Window

  // Optional compatibility aliases
  flowDurationMs?: number;
  synFlagRatio?: number;
  asymmetricRatio?: number;
  flowIATMean?: number;
  flowIATStd?: number;
  flowIATMax?: number;
  flowIATMin?: number;
  fwdIATMean?: number;
  bwdIATMean?: number;
}

export interface PcapParseResult {
  fileName: string;
  fileSizeBytes: number;
  totalPackets: number;
  parsedPackets: ParsedPacket[];
  flows: NetworkFlowFeatures[];
  summary: {
    benignCandidateFlows: number;
    suspiciousCandidateFlows: number;
    primaryProtocol: string;
  };
}

/**
 * Calculates Shannon Entropy of payload bytes (bits per byte: 0.0 to 8.0)
 */
export function calculateShannonEntropy(buffer: Buffer): number {
  if (!buffer || buffer.length === 0) return 0;
  const byteCounts = new Uint32Array(256);
  for (let i = 0; i < buffer.length; i++) {
    byteCounts[buffer[i]]++;
  }
  let entropy = 0;
  const len = buffer.length;
  for (let i = 0; i < 256; i++) {
    if (byteCounts[i] > 0) {
      const p = byteCounts[i] / len;
      entropy -= p * Math.log2(p);
    }
  }
  return Number(entropy.toFixed(3));
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const variance = arr.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

/**
 * Categorizes Destination Port into Service Group integer
 */
export function getDestinationPortCategory(port: number): number {
  if (port === 21) return 21;        // FTP
  if (port === 22) return 22;        // SSH
  if (port === 80 || port === 443 || port === 8080) return 80; // Web HTTP/HTTPS
  if (port === 53) return 53;        // DNS
  return 0;                          // Other
}

/**
 * Parses raw PCAP / PCAPNG buffer into individual packet objects
 */
export function parsePcapBuffer(buffer: Buffer): ParsedPacket[] {
  if (!buffer || buffer.length < 24) {
    throw new Error('Invalid or truncated file: Buffer size is smaller than PCAP header (24 bytes)');
  }

  const magic = buffer.readUInt32BE(0);
  const isPcapStandardBE = magic === 0xa1b2c3d4;
  const isPcapStandardLE = magic === 0xd4c3b2a1;
  const isPcapNanoBE = magic === 0xa1b23c4d;
  const isPcapNanoLE = magic === 0x4d3cb2a1;
  const isPcapNg = magic === 0x0a0d0d0a;

  if (isPcapNg) {
    return parsePcapNgBuffer(buffer);
  }

  if (!isPcapStandardBE && !isPcapStandardLE && !isPcapNanoBE && !isPcapNanoLE) {
    throw new Error('Unsupported or malformed file format: Missing valid PCAP or PCAPNG magic header bytes');
  }

  const littleEndian = isPcapStandardLE || isPcapNanoLE;
  const isNano = isPcapNanoBE || isPcapNanoLE;

  const packets: ParsedPacket[] = [];
  let offset = 24; // Skip 24-byte global PCAP header

  while (offset + 16 <= buffer.length) {
    const tsSec = littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
    const tsUsec = littleEndian ? buffer.readUInt32LE(offset + 4) : buffer.readUInt32BE(offset + 4);
    const inclLen = littleEndian ? buffer.readUInt32LE(offset + 8) : buffer.readUInt32BE(offset + 8);

    offset += 16;

    if (offset + inclLen > buffer.length) break;

    const packetData = buffer.subarray(offset, offset + inclLen);
    offset += inclLen;

    const timestampMs = tsSec * 1000 + (isNano ? Math.floor(tsUsec / 1000000) : Math.floor(tsUsec / 1000));
    const parsed = parseEthernetFrame(packetData, timestampMs);
    if (parsed) packets.push(parsed);
  }

  return packets;
}

function parsePcapNgBuffer(buffer: Buffer): ParsedPacket[] {
  const packets: ParsedPacket[] = [];
  let offset = 0;

  while (offset + 8 <= buffer.length) {
    const blockType = buffer.readUInt32LE(offset);
    const blockTotalLen = buffer.readUInt32LE(offset + 4);

    if (blockTotalLen < 12 || offset + blockTotalLen > buffer.length) break;

    if (blockType === 0x00000006) {
      if (blockTotalLen >= 32) {
        const tsHigh = buffer.readUInt32LE(offset + 12);
        const tsLow = buffer.readUInt32LE(offset + 16);
        const capLen = buffer.readUInt32LE(offset + 20);
        const timestampMs = Number(((BigInt(tsHigh) << 32n) | BigInt(tsLow)) / 1000n);
        const packetData = buffer.subarray(offset + 28, offset + 28 + capLen);
        const parsed = parseEthernetFrame(packetData, timestampMs);
        if (parsed) packets.push(parsed);
      }
    } else if (blockType === 0x00000003) {
      if (blockTotalLen >= 16) {
        const packetLen = buffer.readUInt32LE(offset + 8);
        const packetData = buffer.subarray(offset + 12, offset + 12 + packetLen);
        const parsed = parseEthernetFrame(packetData, Date.now());
        if (parsed) packets.push(parsed);
      }
    }

    offset += blockTotalLen;
  }

  return packets;
}

function parseEthernetFrame(packetData: Buffer, timestampMs: number): ParsedPacket | null {
  if (!packetData || packetData.length < 14) return null;

  let ethType = packetData.readUInt16BE(12);
  let ipOffset = 14;

  if (ethType === 0x8100 && packetData.length >= 18) {
    ethType = packetData.readUInt16BE(16);
    ipOffset = 18;
  }

  if (ethType !== 0x0800 || packetData.length < ipOffset + 20) return null;

  const verIhl = packetData[ipOffset];
  const ipHeaderLen = (verIhl & 0x0f) * 4;
  const ipProtocol = packetData[ipOffset + 9];

  const srcIp = `${packetData[ipOffset + 12]}.${packetData[ipOffset + 13]}.${packetData[ipOffset + 14]}.${packetData[ipOffset + 15]}`;
  const dstIp = `${packetData[ipOffset + 16]}.${packetData[ipOffset + 17]}.${packetData[ipOffset + 18]}.${packetData[ipOffset + 19]}`;

  const transportOffset = ipOffset + ipHeaderLen;
  let sourcePort = 0;
  let destinationPort = 0;
  let protocol: 'TCP' | 'UDP' | 'ICMP' | 'OTHER' = 'OTHER';
  let transportHeaderLen = 0;
  const flags = { fin: false, syn: false, rst: false, psh: false, ack: false, urg: false };

  if (ipProtocol === 6 && packetData.length >= transportOffset + 20) {
    protocol = 'TCP';
    sourcePort = packetData.readUInt16BE(transportOffset);
    destinationPort = packetData.readUInt16BE(transportOffset + 2);
    const dataOffsetByte = packetData[transportOffset + 12];
    transportHeaderLen = ((dataOffsetByte >> 4) & 0x0f) * 4;

    const flagByte = packetData[transportOffset + 13];
    flags.fin = (flagByte & 0x01) !== 0;
    flags.syn = (flagByte & 0x02) !== 0;
    flags.rst = (flagByte & 0x04) !== 0;
    flags.psh = (flagByte & 0x08) !== 0;
    flags.ack = (flagByte & 0x10) !== 0;
    flags.urg = (flagByte & 0x20) !== 0;
  } else if (ipProtocol === 17 && packetData.length >= transportOffset + 8) {
    protocol = 'UDP';
    sourcePort = packetData.readUInt16BE(transportOffset);
    destinationPort = packetData.readUInt16BE(transportOffset + 2);
    transportHeaderLen = 8;
  } else if (ipProtocol === 1 && packetData.length >= transportOffset + 8) {
    protocol = 'ICMP';
    transportHeaderLen = 8;
  } else {
    return null;
  }

  const payloadOffset = transportOffset + transportHeaderLen;
  const payloadBuffer = payloadOffset < packetData.length ? packetData.subarray(payloadOffset) : Buffer.alloc(0);

  return {
    timestampMs,
    sourceIp: srcIp,
    destinationIp: dstIp,
    sourcePort,
    destinationPort,
    protocol,
    packetSize: packetData.length,
    headerLength: ipHeaderLen + transportHeaderLen,
    payloadLength: payloadBuffer.length,
    payloadBuffer,
    tcpFlags: flags,
  };
}

export function aggregatePacketsIntoFlows(packets: ParsedPacket[]): NetworkFlowFeatures[] {
  if (!packets || packets.length === 0) return [];

  interface FlowState {
    flowId: string;
    sourceIp: string;
    sourcePort: number;
    destinationIp: string;
    destinationPort: number;
    protocol: string;
    fwdPackets: ParsedPacket[];
    bwdPackets: ParsedPacket[];
    allPackets: ParsedPacket[];
  }

  const flowMap = new Map<string, FlowState>();
  const uniqueSrcIps = new Set<string>();

  for (const pkt of packets) {
    uniqueSrcIps.add(pkt.sourceIp);
    const endpointA = `${pkt.sourceIp}:${pkt.sourcePort}`;
    const endpointB = `${pkt.destinationIp}:${pkt.destinationPort}`;
    const isCanonical = endpointA <= endpointB;
    const flowId = `${pkt.protocol}:${isCanonical ? endpointA + '-' + endpointB : endpointB + '-' + endpointA}`;

    let state = flowMap.get(flowId);
    if (!state) {
      state = {
        flowId,
        sourceIp: pkt.sourceIp,
        sourcePort: pkt.sourcePort,
        destinationIp: pkt.destinationIp,
        destinationPort: pkt.destinationPort,
        protocol: pkt.protocol,
        fwdPackets: [],
        bwdPackets: [],
        allPackets: [],
      };
      flowMap.set(flowId, state);
    }

    const isFwd = pkt.sourceIp === state.sourceIp && pkt.sourcePort === state.sourcePort;
    if (isFwd) state.fwdPackets.push(pkt);
    else state.bwdPackets.push(pkt);
    state.allPackets.push(pkt);
  }

  const totalFlowsInCapture = Math.max(1, flowMap.size);
  const sourceDiversityRatio = Number((uniqueSrcIps.size / totalFlowsInCapture).toFixed(3));

  const flowFeaturesList: NetworkFlowFeatures[] = [];

  for (const state of flowMap.values()) {
    state.allPackets.sort((a, b) => a.timestampMs - b.timestampMs);

    const firstTimestampMs = state.allPackets[0].timestampMs;
    const lastTimestampMs = state.allPackets[state.allPackets.length - 1].timestampMs;
    const flowDurationMs = Math.max(1, lastTimestampMs - firstTimestampMs);
    const flowDurationUs = flowDurationMs * 1000; // Converted to Microseconds for CIC-IDS equivalence

    const fwdLengths = state.fwdPackets.map(p => p.packetSize);
    const bwdLengths = state.bwdPackets.map(p => p.packetSize);
    const allLengths = state.allPackets.map(p => p.packetSize);

    const totalFwdPackets = state.fwdPackets.length;
    const totalBwdPackets = state.bwdPackets.length;
    const totalFwdBytes = fwdLengths.reduce((a, b) => a + b, 0);
    const totalBwdBytes = bwdLengths.reduce((a, b) => a + b, 0);
    const totalBytes = totalFwdBytes + totalBwdBytes;
    const totalPackets = state.allPackets.length;

    // Inter-Arrival Times (IAT) in Microseconds
    const flowIATsUs: number[] = [];
    for (let i = 1; i < state.allPackets.length; i++) {
      flowIATsUs.push(Math.max(0, (state.allPackets[i].timestampMs - state.allPackets[i - 1].timestampMs) * 1000));
    }

    const fwdIATsUs: number[] = [];
    for (let i = 1; i < state.fwdPackets.length; i++) {
      fwdIATsUs.push(Math.max(0, (state.fwdPackets[i].timestampMs - state.fwdPackets[i - 1].timestampMs) * 1000));
    }

    const bwdIATsUs: number[] = [];
    for (let i = 1; i < state.bwdPackets.length; i++) {
      bwdIATsUs.push(Math.max(0, (state.bwdPackets[i].timestampMs - state.bwdPackets[i - 1].timestampMs) * 1000));
    }

    let synFlagCount = 0;
    let ackFlagCount = 0;
    let finFlagCount = 0;
    let rstFlagCount = 0;
    let pshFlagCount = 0;

    for (const pkt of state.allPackets) {
      if (pkt.tcpFlags.syn) synFlagCount++;
      if (pkt.tcpFlags.ack) ackFlagCount++;
      if (pkt.tcpFlags.fin) finFlagCount++;
      if (pkt.tcpFlags.rst) rstFlagCount++;
      if (pkt.tcpFlags.psh) pshFlagCount++;
    }

    const payloadBuffers = state.allPackets.map(p => p.payloadBuffer).filter(b => b && b.length > 0);
    const combinedPayload = payloadBuffers.length > 0 ? Buffer.concat(payloadBuffers) : Buffer.alloc(0);
    const payloadEntropy = calculateShannonEntropy(combinedPayload);

    const durationSec = flowDurationMs / 1000;

    flowFeaturesList.push({
      flowId: state.flowId,
      sourceIp: state.sourceIp,
      sourcePort: state.sourcePort,
      destinationIp: state.destinationIp,
      destinationPort: state.destinationPort,
      protocol: state.protocol,
      firstTimestampMs,
      lastTimestampMs,
      flowDurationUs,
      totalFwdPackets,
      totalBwdPackets,
      totalFwdBytes,
      totalBwdBytes,
      fwdPacketLengthMin: fwdLengths.length > 0 ? Math.min(...fwdLengths) : 0,
      fwdPacketLengthMax: fwdLengths.length > 0 ? Math.max(...fwdLengths) : 0,
      fwdPacketLengthMean: Number(mean(fwdLengths).toFixed(2)),
      fwdPacketLengthStd: Number(stdDev(fwdLengths).toFixed(2)),
      bwdPacketLengthMin: bwdLengths.length > 0 ? Math.min(...bwdLengths) : 0,
      bwdPacketLengthMax: bwdLengths.length > 0 ? Math.max(...bwdLengths) : 0,
      bwdPacketLengthMean: Number(mean(bwdLengths).toFixed(2)),
      bwdPacketLengthStd: Number(stdDev(bwdLengths).toFixed(2)),
      flowBytesPerSec: Number((totalBytes / durationSec).toFixed(2)),
      flowPacketsPerSec: Number((totalPackets / durationSec).toFixed(2)),
      flowIATMeanUs: Number(mean(flowIATsUs).toFixed(2)),
      flowIATStdUs: Number(stdDev(flowIATsUs).toFixed(2)),
      flowIATMinUs: flowIATsUs.length > 0 ? Math.min(...flowIATsUs) : 0,
      flowIATMaxUs: flowIATsUs.length > 0 ? Math.max(...flowIATsUs) : 0,
      fwdIATMeanUs: Number(mean(fwdIATsUs).toFixed(2)),
      fwdIATStdUs: Number(stdDev(fwdIATsUs).toFixed(2)),
      bwdIATMeanUs: Number(mean(bwdIATsUs).toFixed(2)),
      bwdIATStdUs: Number(stdDev(bwdIATsUs).toFixed(2)),
      fwdPacketsPerSec: Number((totalFwdPackets / durationSec).toFixed(2)),
      bwdPacketsPerSec: Number((totalBwdPackets / durationSec).toFixed(2)),
      synFlagCount,
      ackFlagCount,
      finFlagCount,
      rstFlagCount,
      pshFlagCount,
      averagePacketSizeBytes: Number(mean(allLengths).toFixed(2)),
      downUpRatio: Number((totalBwdPackets / Math.max(1, totalFwdPackets)).toFixed(2)),
      payloadEntropy,
      destinationPortCategory: getDestinationPortCategory(state.destinationPort),
      sourceDiversityRatio,
    });
  }

  return flowFeaturesList;
}

export function extractFlowsFromPcap(fileName: string, buffer: Buffer): PcapParseResult {
  const parsedPackets = parsePcapBuffer(buffer);
  const flows = aggregatePacketsIntoFlows(parsedPackets);

  let benignCandidateFlows = 0;
  let suspiciousCandidateFlows = 0;

  for (const flow of flows) {
    if (flow.synFlagCount > 10 || flow.flowPacketsPerSec > 10000 || flow.payloadEntropy > 7.0) {
      suspiciousCandidateFlows++;
    } else {
      benignCandidateFlows++;
    }
  }

  const protocolCounts: Record<string, number> = {};
  for (const pkt of parsedPackets) {
    protocolCounts[pkt.protocol] = (protocolCounts[pkt.protocol] || 0) + 1;
  }
  let primaryProtocol = 'TCP';
  let maxCount = 0;
  for (const [proto, count] of Object.entries(protocolCounts)) {
    if (count > maxCount) {
      maxCount = count;
      primaryProtocol = proto;
    }
  }

  return {
    fileName,
    fileSizeBytes: buffer.length,
    totalPackets: parsedPackets.length,
    parsedPackets,
    flows,
    summary: {
      benignCandidateFlows,
      suspiciousCandidateFlows,
      primaryProtocol,
    },
  };
}
