import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PacketAnalysisPage } from '../pages/PacketAnalysisPage';
import { MonitoringProvider } from '../context/MonitoringContext';

describe('PacketAnalysisPage Component', () => {
  it('renders PCAP upload dropzone and preloaded sample datasets', () => {
    render(
      <MonitoringProvider>
        <PacketAnalysisPage />
      </MonitoringProvider>
    );

    expect(screen.getByText('PCAP & CSV Feature Extraction Pipeline')).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop PCAP or CSV network trace files/i)).toBeInTheDocument();
    expect(screen.getByText('Preloaded Sample PCAP Datasets')).toBeInTheDocument();
    expect(screen.getByText('CIC-IDS2017_SYN_Flood_Sample.pcap')).toBeInTheDocument();
  });

  it('triggers PCAP analysis when clicking sample dataset', async () => {
    render(
      <MonitoringProvider>
        <PacketAnalysisPage />
      </MonitoringProvider>
    );

    const sampleItem = screen.getByText('CIC-IDS2017_SYN_Flood_Sample.pcap');
    fireEvent.click(sampleItem);

    await waitFor(
      () => {
        expect(screen.getByText('Extracted Network Flow Feature Vectors')).toBeInTheDocument();
        expect(screen.getByText('SHAP Feature Attribution Visualizer')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
